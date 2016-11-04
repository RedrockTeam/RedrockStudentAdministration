'use strict';
import Base from './base.js'
import fs from 'fs';
import unzip from 'unzip';
import {res} from '../../common/function.js'

export default class extends Base {
  _json(status,message) {
    return this.json({
      status: status,
      message: this.json(message)
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
    let _path = './www/upload/2014213898/web研发部/1/';
    fs.createReadStream(_path+name).pipe(unzip.Extract({path:_path}));
    await this.unzipDb(id);
    
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
        status: 400,
        message: '登陆成功'
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
    let branch = await session('managerId');
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
        branch  = await this.session('managerId',1);
    let branch = await this.session('managerId');
    let id = partern.get.stu_id;
    id.foreach(async (e) => {
      let state = await this.model('stubranch').delStu({b_id: branch, stu_id: e});
      if(!state) break;
    });
     if(!state) {
      this._json(400,'删除失败');
    } else {
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
    let branch = 1;
    let nowTime;
    let nhwList = await this.model('homework').notEnd({b_id: branch,hw_deadline: {'>' : nowTime}});
    let allNum = await this.model('stubranch').allPerson({b_id: branch}).length;
    let npulishNum = nhwList.commit.length;
    let yhwList = await this.model('homework').notEnd({b_id: branch,hw_deadline: {'<' : nowTime}});
    let ypulishNum = yhwList.commit.length;

    this._json(200,{
      nhwList: nhwList,
      yhwList: yhwList,
      allNum: allNum,
      npulishNum: npulishNum, 
      ypulishNum: ypulishNum
      });
  }
  /**
  *查看作业 已未上交
  * partern.get.state 是否上交状态
  hwId 作业id
  return:{stu_id,hw_time,hw_score,student[{'id,stu_num,stu_name'}...]}
  [
    {
      "stu_name": "九",
      "stu_num": "1214141",
      "id": 2,
      "sb_commit": "8"
    },
    {
      "allhw": 1
    }
  ]
  */
  async checkhw(partern) {
    await this.session('managerId',1);
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

  async uploadCourseWare(){
    
  }
}