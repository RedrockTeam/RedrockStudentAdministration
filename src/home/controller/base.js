'use strict';

export default class extends think.controller.base {
  /**
   * some base method in here
   */
  creatRedisCilent(){
    let	_redis = new  redis.createClient();
		_redis.on("error", function (err) {
				console.log("Error " + err);
		});
    return _redis
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
  makedir(path){
    think.mkdir(path)
    think.chmod(path)
  }
}