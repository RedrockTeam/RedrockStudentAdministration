'use strict';

import Base from './base.js'
import redis from 'redis'
import fs from 'fs'

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
		this.session('userId', 2014213898)
    return this.display()
  }
/**	
 * 上传接口
 */
  async uploadAction(){
		let	_redis = new  redis.createClient();
		_redis.on("error", function (err) {
				console.log("Error " + err);
		});
		/**
		 * userId: 学号
		 * filename: 文件名
		 * filePath: tmp文件路径
		 * fileTime: 上传文件次数
		 */
		let fileMessage = this.post(),
				userId = await this.session('userId'),
				fileName = fileMessage.name,
				fileTime = fileMessage.time,
				filePath = this.file(fileName).path,
				uploadPath = think.RESOURCE_PATH + '/upload'

				await fs.renameSync(filePath, `${uploadPath}/${fileName}`)
				//将文件rename，防止被这个垃圾框架自动清除

		//出口
		if(fileMessage.complete){
			_redis.hset(userId, 'complete', true)
			this.success({complete:true})
		}
		_redis.hset(userId, fileTime, `${uploadPath}/${fileName}`)
		_redis.hset(userId, 'complete', false)
		_redis.quit()
		this.success();
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

	async taskAction(){
		let	_redis = new  redis.createClient();
		_redis.hgetall("2014213898", (err, res) => {
			let content = []
			for(let i in res){
				if(i == "complete") continue
				content[parseInt(i)] = this.readFilePromise(res[i]);
			}
			Promise.all(content)
			.then((fileArr) => {
				let completeFile = Buffer.concat(fileArr)
				fs.writeFile(`/Users/duzexuan/node/test_dir/lalala.jpg`, completeFile, ()=>{
					this.success();
				})
			})
			.catch(err => {
				console.log(err)
			})
		})
	}
}