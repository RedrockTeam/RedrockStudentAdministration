'use strict'
import Base from './base.js'
import fs from 'fs'
import unzip from 'unzip'
import {res} from '../../common/function.js'
import redis from 'redis'

export default class extends Base {
  _json(status,message) {
    if(Object.prototype.toString.call(message) != "[object String]") {
      message = this.json(message);
    }
    return this.json({
      status: status,
      message: message
    })
  }
  /**
  *解压
    {
        path:文件路径
        name: 文件名
    }
  */  
  async index(partern){
    let id = 2;
    let name = '1.zip';
    let _path = './www/upload/2014213897/web研发部/1/';
    fs.createReadStream(_path+name).pipe(unzip.Extract({path:_path}));
    // await this.unzipDb(id);
    
  }
  //解压出口，写入数据库并返回200
  async unzipDb(id){
    let commit = this.model('commit');
    await commit.dec({id:id},{is_free:1});
    return this.json({
      status: 200,
      message: '解压成功'
    });
  }


  /**
  *登陆
    {
      name: this.post('name') 用户名
      passwd:this.post('passwd')密码
    }
    return json{
      status: 200,
      message: "登录成功"
      manager: 
    }
  */
  async login(partern) {
    let name = partern.post.username;
    let passwd = partern.post.password;
    console.log(name, passwd)
    if(!name || !passwd)
      return this.json({
        status: 400,
        message: '参数不足'
      })
    let info = await this.model('branch')
    .findManager({
      b_manager: name,
      b_password: passwd
    });
    console.log(info)
    if (think.isEmpty(info)) {
      return this.json({
        status: 400,
        message: '用户名或密码错误'
      });
    } else {
      await this.session('managerId',info.id);
      return this.json({
        status: 200,
        message: '登陆成功',
        managerInfo: info
      });
    }
  }


  /**
  *人员管理
    branch: await session('managerId'), 登陆后把部门id存入
    page: get, 第几页
    每页默认15条数据
    type: 排序规则 up(分数升序, 默认)/dowm(分数降序)
      rertun: [{ 
            id: 2,
            stu_id: 1,
            b_id: 1,
            sb_score: 50,
            sb_commit: '8',
            'stu_id,sb_score': [{ id: 1, stu_name: '陈', stu_academy: '通信' }]
            }]
  */
  async personManage(partern) {
    let branch = await this.session('managerId'),
        page = partern.get.page || 1,
        type = partern.get.type || 'up'
    let persons = await this
    .model('stubranch')
    .allPerson({
      b_id: branch,
      page: page,
      type: type
    });
    //return
    if(persons.length == 0){
      return this._json(400,'查询人员管理页失败');
    } else {
      return this._json(200,persons);
    } 
  }

  /**
  *修改分数
  id: partern.post.id   student 表中的id stubranch 的stu_id
  score: partern.post.score 此部门此学生的分数
  branch: await session('managerId') 部门id
  */
  async changeScore(partern) {
    let score = partern.post.score;
    let id = partern.post.stu_id;
    let state = await this
    .model('stubranch')
    .updateScore({
      b_id: await this.session('managerId'), 
      stu_id: id
    },{
      sb_score: score
    });
    if(state === 0) {
      this._json(400,'修改分数失败');
    } else {
      this._json(200,'修改分数成功');
    }
  }
  /**
  *踢人 删一个
  id: partern.post.id   student 表中的id stubranch 的stu_id
  branch: await session('managerId') 部门id
  1.删除本部门记录
  2.判断此人是否还有其他部门
  */
  async delStu(partern){
    let branch = await this.session('managerId');
    let id = partern.get.stu_id;
    let state = await this
    .model('stubranch')
    .delStu({b_id: branch, stu_id: id});
    // let isNull = await this
    // .model('stubranch')
    // .isNull({stu_id: id});
    // if(think.isEmpty(isNull)) {
    //   //删除所有记录
    //   //的步骤！
    // }
    if(state === 0) {
      this._json(400,'删除失败');
    } else {
      this._json(200,'删除成功');
    }
  }


  /**
   * 批量踢人
   */

  async delAll(partern) {
    let branch = await this.session('managerId');
    let id = partern.get.stu_id;
    let state = await this.model('stubranch').delStu({b_id: branch, stu_id: {'in':JSON.parse(id)}});
    // console.log(state);
    if(state === 0) {
      this._json(400,'删除失败');
    }else{
      this._json(200,'删除成功');
    }
  }


  /**
   * 学生查询
   * message = partern.get.message, 查询信息
      type    = partern.get.type, 查询方式 学号/学院/姓名
      branch  = await session('managerId'), 部门ID
      sort    = partern.get.sort || 'up' 排序方式
   *return
    {
      "status": 200,
      "persons": [
        {
          "sb_score": 91,
          "stu_num": "2345655768",
          "stu_name": "陈",
          "stu_academy": "通信",
          "id": 1
        }
      ]
    }
   */
  async selectStudent(partern){
    let message = partern.get.message,
        type    = partern.get.type,
        branch  = await this.session('managerId'),
        sort    = partern.get.sort || 'up',
        res = []
    switch (type) {
      case 'stunum':
        res = await this
        .model('stubranch')
        .selectByStunum(message, branch,sort)
        break;
      case 'academy':
        res = await this
        .model('stubranch')
        .selectByAcademy(message, branch,sort)
        break;
      case 'stuname':
        res = await this
        .model('stubranch')
        .selectByStuname(message, branch,sort)
        break;
    }
    this.json({
      status: 200,
      persons: res
    })
  }
  /**
  *作业发布
  title:作业名
  explain :说明
  time:截止时间
  branch: await session('managerId') 部门id
  */
  async publishWork(partern) {
    let title = partern.post.title;
    let expain = partern.post.expain;
    let time = partern.post.time;
    let branch = await session('managerId');
    let state = await this.model('homework').addDoc({
      hw_title: name,
      hw_detail: explain,
      hw_deadline: time
    });
    if(state == '') {
      this._json(400,'发布失败');
    } else {
      this._json(200,'发布成功');
    }
  }

  /**
  *未已截止作业
  branch: await session('managerId') 部门id
  nowTime:当前时间
  return: {
      nhwList: 未截止列表(id,hw_title','hw_detail','hw_pulish','hw_deadline,commit[{hw_id}...])
      yhwList: 已截止...
      allNum: 总人数
      npulishNum: 未截止作业交的人数 
      ypulishNum: 已截止作业交的人数
  }
  */
  async ifEnd(partern) {
    //let branch = await this.session('managerId');
    let branch = 1
    let nowTime = think.datetime();
    let nhwList = await this.model('homework').notEnd({b_id: branch,hw_deadline: {'>' : nowTime}});
    let yhwList = await this.model('homework').notEnd({b_id: branch,hw_deadline: {'<' : nowTime}});

    this._json(200,{
      nhwList: nhwList,
      yhwList: yhwList,
      });
  }
  /**
   * 删除发布的作业
   * let id = partern.get.id;
   * return 200||400
   */
  async del(partern) {
    let id = partern.get.id;
    let state = this.model('homework').del({id: id});
    if(state) {
       return this._json(200,'删除成功');
     } else {
       return this._json(400,'删除失败');
     }
  }
  /**
  *查看作业 已未上交  那啥 header从上一页自己传吧= =
  * partern.get.state 是否上交状态
  hwId 作业id
  return:{id,cm_place,stu_id,hw_time,hw_score,student[{'id,stu_num,stu_name'}...]}
  [
    {
      {
      id :1 
    "stu_id": 1,
    "hw_time": "0000-00-00 00:00:00",
    "hw_score": null,
    "cm_place": "重庆",
    "student": [
      {
        "id": 1,
        "stu_num": "2345655768",
        "stu_name": "陈"
      }
    ]
  ]
  */
  async checkhw(partern) {
   
    let b_id = await this.session('managerId'),
        hwId = partern.get.hw_id,
        state = partern.get.state || 'already',
        check = await this.model('commit').check({hw_id: hwId},state,b_id);
        console.log(b_id);
    if(state != 'already') {
      console.log(check)
    }
    if(think.isEmpty(check)) {
      return this._json(400,'无记录');
    } else {
      return this._json(200,check);
    }
  }

/**
 * 下载
 *  let id = partern.get.id  commit的ID
   

    return
    [
      {
        "cm_place": "重庆",
        "student": []
      }
    ]
 */
  async downHw(partern){
    let id = partern.get.id,
        path;
    if(Object.prototype.toString.call(JSON.parse(id)) === '[object Array]') {
      path = await this.model('commit').getPath({id:{'in' : JSON.parse(id)}});
    } else {
      path = await this.model('commit').getPath({id:id});
    }
    if(think.isEmpty(path)){
      return this._json(400,'下载失败')
    }else{
       return this.json({
         status:200,
         message:path
       });
    }
  }


  /**作业分数修改
   * let id = partern.get.id  commit的ID
   * let score = partern.get.score; 分数
   */
  async changeHw(partern) {
     let id = partern.get.id;
     let score = partern.get.score;
     let state = this
     .model('commit')
     .dec({id: id},{hw_score: score});
     if(state) {
        return this._json(200,'修改成功');
     } else {
       return this._json(400,'修改失败');
     }
  }

   /**删除学员作业
   * let id = partern.get.id  commit的ID
   */
  async delHw(partern) {
     let id = partern.get.id,
         state;
     if(Object.prototype.toString.call(JSON.parse(id)) === '[object Array]') {
       state = await this
        .model('commit')
        .del({id: {'in': JSON.parse(id)}});
     } else {
        state = await this
        .model('commit')
        .del({id: id});
     }
     if(state) {
        return this._json(200,'删除成功');
      } else {
        return this._json(400,'删除失败');
      }
  }
  /** 
   * input{
   *   id: 课件id
   * }
   * return json{
   *  status: 200/400
   *  message
   * }
   */
  async delCourseWare(partern){
    let res = await this
    .model('courseware')
    .del(partern.get.id)
    let message = {}
    if(!res){
      message = {
        status: 200,
        message: 'ok'
      }
    }else{
      message = {
        status: 404,
        message: "出了点问题"
      }
    }
    return this.json(message)
  }
  /**
   * input:formdata{
   *   file: 课件文件 文件类型待定(暂支持zip)
   *   title: 课件标题
   *   descript: 课件描述 
   *   name: 课件名称
   * }
   */
  async uploadCourseWare(partern){
    //获取信息
    let b_id     = await this.session('managerId'),
        savePath = `${think.RESOURCE_PATH}/courseware/${b_id}`,
        title    = partern.post.title,
        descript = partern.post.discrpit,
        file     = this.file(partern.post.name),
        tmpath   = this.file(fileName).path
    //文件写入
    let rename = `${savePath}/${partern.post.name}` 
    await fs.renameSync(tmpath, rename)
    //数据库记录
    this
    .model('courseware')
    .add({
      cw_title:  title,
      cw_detail: descript,
      cw_time:   think.datetime(),
      cw_branch: b_id,
      cw_place:  rename
    })
    .then((row) => {
      if(!row)
        return this.json({
          status: 500,
          message: "崩了？"
        })
    //跟新缓存
      let _redis = this.creatRedisCilent()
      const key = 'courseWare'
      _redis.hdel('courseWare', b_id)
      return this.json({
          status: 200,
          message: "上传成功"
      })
    })

  }
}