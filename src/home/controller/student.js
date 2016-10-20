'use strict';

import Base from './base.js'
import redis from 'redis'
import fs from 'fs'

export default class extends Base {

/** 
 * 登录方法，
 * stunum password
 * session设置学号
 */

  async login(partern){
    let stunum = partern.post.stunum || null,
        password = partern.post.password || null
    if(!stunum || !password)
    return this.json({
      status: 400,
      message: "参数不足"
    })
    let res = await this
    .model('student')
    .where({
      stu_num: stunum,
      stu_password: password
    })
    .select()
    if(!res.length){
      return this.json({
        status: 400,
        message: "用户名密码不正确"
      })
    }else{
      await this.session('stunum', stunum)
      return this.json({
        status: 200,
        message: "登陆成功"
      })
    }
  }
/**	
 * 上传接口
 * partern{
 *    fileName: 文件名
 *    filePath: tmp文件路径
 *    fileTime: 上传文件次数
 *    realpath: www/upload/学号/部门/文件名
 * }
 */
  async upload(partern){
    await this.session('stunum', 2014213898)
		let	_redis = new  redis.createClient();
		_redis.on("error", function (err) {
				console.log("Error " + err);
		});
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
      let res = await this
      .model('student')
      .commitHomework({
        hw_id: hw_id,
        stu_id: stunum,
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

	readFilePromise(path){
		return new Promise((resolve, reject) => {
			fs.readFile(path, (err, chunk)=>{
				if(err)
					return reject(err)
					resolve(chunk)
			})
		})
	}
/**
 * 文件分片拼接任务队列
 */
	async task(){
		let	_redis = new redis.createClient();
		_redis.hgetall("2014213898", (err, res) => {
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
			Promise.all(content)
			.then((fileArr) => {
				let completeFile = Buffer.concat(fileArr)
        return think.rmdir(`${message.savePath}`, true)
        .then(() => {
          this.makedir(`${message.savePath}`);
          fs.writeFile(`${message.savePath}/${message.hw_id}.zip`, completeFile, () => {
            _redis.del(message.stunum)
            this.success();
          })
        }).catch(err => {
          console.log(err)
        })
			})
			.catch(err => {
				console.log(err)
			})
		})
	}
  makedir(path){
    think.mkdir(path)
    think.chmod(path)
  }
}