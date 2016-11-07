'use strict';

import Base from './base.js'
import redis from 'redis'
import fs from 'fs'

export default class extends Base {
  creatRedisCilent(){
    let	_redis = new  redis.createClient();
		_redis.on("error", function (err) {
				console.log("Error " + err);
		});
    return _redis
  }

/** 
 * 登录方法，
 * input:{
 *    stunum//学号
 *    password//
 * }
 * return{
 *    status: 200
 *    message: 信息
 *    stubase: 该学生所有信息
 * }
 * session设置学号与学生id //学号主要用于上传用，普通逻辑用于其他业务
 */
  async login(partern){
    let stunum = partern.post.stunum || null,
        password = partern.post.password || null
    if(!stunum || !password)
    return this.json({
      status: 400,
      message: "参数不足"
    })
    let id = await this
    .model('student')
    .selectId({
      stu_num: stunum,
      stu_password: password
    })
    if(!id.length){
      return this.json({
        status: 400,
        message: "用户名密码不正确"
      })
    }else{   
      let stuBase = await this
          .model('student')
          .getStuMessageById(id[0].id)
      await this.session('stunum', stunum)
      await this.session('id', id[0].id)
      await this.session('stubase', stuBase)
      return this.json({
        status: 200,
        message: "登陆成功",
        stuBase: stuBase
      })
    }
  }
/**	
 * 上传接口
 * input post{
 *    fileName: 分片的文件名(要与次数有关比如 peace1 peace2 peace3)每个分片的文件名不同
 *    fileTime: 分片的第几次
 *    hw_id: 作业的id在查看作业记录的返回信息里有
 *    branch: 作业对应的部门名字
 *    complete: true/false 标志是否已经上传完毕（是否为分片的最后一个文件）
 * }
 * return json{
 *    status: 200
 *    complete: 文件是否已经全部上传完毕 
 * }
 *    
 */
  async upload(partern){
    await this.session('stunum', 2014213897)
    await this.session('id', 1)
		let	_redis = this.creatRedisCilent()
		let fileMessage = partern.post,
				stunum = await this.session('stunum'),
				fileName = fileMessage.fileName,
				fileTime = fileMessage.fileTime,
				filePath = this.file(fileName).path,
        hw_id = fileMessage.hw_id,
        branch = fileMessage.branch,
				uploadPath = `${think.RESOURCE_PATH}/upload/${stunum}/${branch}/${hw_id}`,
        realName = `${uploadPath}/${fileName}`,
        is_exit = fs.existsSync(uploadPath)
        if(!is_exit){
          this.makedir(uploadPath)
        }
		    await fs.renameSync(filePath, realName)
        
				// 将文件rename，防止被这个垃圾框架自动清除

		// 出口
		if(fileMessage.complete){
			_redis.hset(stunum, 'complete', true)
      _redis.hset(stunum, 'message', JSON.stringify({
        savePath: uploadPath,
        stunum: stunum,
        hw_id: hw_id
      }))
      this.pushIntoQueue(_redis, stunum, uploadPath)
      let res = await this
      .model('student')
      .commitHomework({
        hw_id: hw_id,
        stu_id: await this.session('id'),
        hw_time: think.datetime(),
        hw_score: 0,
        cm_place: uploadPath + '/' + hw_id
      })
      if(res)
        return this.json({
          status: 200,
          complete: true
        })
      else
        return this.json({
          status: 200,
          message: "出了点问题",
          complete: false
        })
		}
		_redis.hset(stunum, fileTime, realName)
		_redis.hset(stunum, 'complete', false)
		_redis.quit()
		return this.json({
      status: 200,
      complete: false,
    });
  }
  /**
   * 域是connectQueue
   * name: stunum
   * value: uploadpath
   */
  pushIntoQueue(_redis, stunum, uploadPath){
    const key = 'connectQueue'
    return _redis.hset(key, stunum, uploadPath)
  }

/**
 * 文件分片拼接
 * 先便利queue队列,把待处理的学号拿出来,
 * 将每一个学号对应交给connectByStunum方法处理
 * 进入下一次循环
 */
  checkPromise(_redis, key){
    return new Promise((resolve, reject) => {
      _redis.hgetall(key, (err, res) => {
        resolve(res)
      })
    })
  }

  taskAction(){
    const key = 'connectQueue'
    let	_redis = new redis.createClient();
    this
    .checkPromise(_redis, key)
    .then(res => {
      if(res == null){
        console.log(res)
        return setTimeout(()=>{this.taskAction()}, 20000)
      }
      let promiseArr = []
      for(let i in res){
        promiseArr.push(this.connectByStunum(_redis, i))
      }
      Promise.all(promiseArr)
      .then((keys) => {
        for(let i = 0; i < keys.length; i++){
          this.pop(keys[i], _redis)
        }
        console.log(keys)
        setTimeout(()=>{this.taskAction()}, 20000)
        return this.success()
      })
    })
    .catch(err => {console.log(err)})
  }
  pop(stunum, _redis){
    const key = 'connectQueue'
    _redis.hdel(key, stunum)
  }
	connectByStunum(_redis, key){
    return new Promise((resolve, reject)=>{
      _redis.hgetall(key, (err, res) => {
        let content = [],
            message = {}
        for(let i in res){
          if(i == "complete") continue
          if(i == "message"){
            message = JSON.parse(res[i])
            continue
          }
          content[parseInt(i)] = this.readFilePromise(res[i]);
        }
        return this.connect(_redis, content, message, resolve, key)
      })
    })
	}
  connect(_redis, content, message, resolve, key){
    return Promise.all(content)
			.then((fileArr) => {
				let completeFile = Buffer.concat(fileArr)
        return think.rmdir(`${message.savePath}`, true)
        .then(() => {
          this.makedir(`${message.savePath}`);
          fs.writeFile(`${message.savePath}/${message.hw_id}.zip`, completeFile, () => {
            _redis.del(message.stunum)
            resolve(key)
          })
        }).catch(err => {
          console.log(err)
        })
			})
			.catch(err => {
				console.log(err)
			})
  }
  readFilePromise(path){
		return new Promise((resolve, reject) => {
			fs.readFile(path, (err, chunk)=>{
				if(err)
					return reject(err)
					resolve(chunk)
			})
		})
	}
  makedir(path){
    think.mkdir(path)
    think.chmod(path)
  }
  /**
   * 通过学号获取对应类型的作业列表
   * input: get{
   *    id: 学生id
   * }
   * return json{
   *     status: 200,
   *     homeworks: 所有作业记录 
   * }
   */
  async getHomeWorkById(partern){
    let id = partern.get.id
    if(!id) return this.json({
      status: 400,
      message: "参数不足"
    })
    let res = {
      unfinished: null,
      finished: null,
      expired: null
    }
    res.unfinished = await this
      .model('student')
      .getUnfinsh(id)
    res.finished = await this
      .model('student')
      .getFinsh(id)
    res.expired = await this
      .model('student')
      .getTimeout(id)
    return this.json({
      status: 200,
      homeworks: res
    })
  }

  /**
   * 课件资料数据接口
   * input get{
   *    b_id: 部门的id
   * }
   * return: json{
   *    status: 200,
   *    message: 'ok',
   *    courseWare: 对应部门的所有课件资料
   * }
   */
   getCourseWare(partern){
    let b_id = partern.get.b_id,
    _redis = this.creatRedisCilent()
    this
    .getCourseWareCache(_redis, b_id)
    .then((courseWare) => {
      if(!courseWare){
        let data = this
        .model('student')
        .getCourseWare(b_id)
        .then((data) => {
          this.setCacheWare(_redis, b_id, JSON.stringify(data))
          this.json({
            status: 200,
            message: 'ok',
            courseWare: data
          })
        })
      }else{
        this.json({
            status: 200,
            message: 'ok',
            courseWare: courseWare
        })
        _redis.quit()
      }
    })
    .catch(err => {
      throw new Error(err)
    })
  }
  setCacheWare(_redis, id, data){
    const key = 'courseWare'
    _redis.hset(key, id, data)
    _redis.quit()
  }
  getCourseWareCache(_redis, id){
    const key = 'courseWare'
    return new Promise((resolve, reject) => {
      _redis.hget(key, id, (err, chunk)=>{
        if(err) return console.log(err)
        resolve(chunk)
      })
    })
  }
  
}