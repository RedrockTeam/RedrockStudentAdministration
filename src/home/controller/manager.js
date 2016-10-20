'use strict';
import Base from './base.js'
import fs from 'fs';
import unzip from 'unzip';
export default class extends Base {
  /**
  *入口
    {
        name: 文件名
    }
  */  
  async indexAction(){
    let userId = await this.session('userId');
    let name = this.post().name;
    let _path = think.RESOURCE_PATH+'/upload/'+userId;
    fs.createReadStream(_path+name).pipe(unzip.Extract({path:_path}));
    //出口
    await unzipDb(userId,name);
  }

  async unzipDb(userId,name){
    let student = this.model('student');
    let id = await student.getId({stu_num: userId});
    let commit = this.model('commit');
    await commit.addPlace({});
  }
}