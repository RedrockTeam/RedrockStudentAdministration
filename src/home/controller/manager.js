'use strict';
import Base from './base.js'
import fs from 'fs';
import unzip from 'unzip';
export default class extends Base {
  /**
  *入口
    {
        path:文件路径
        name: 文件名
    }
  */  
  async indexAction(){
    let id = 2;
    let name = '1.zip';
    let _path = './www/upload/2014213898/web研发部/1/';
    fs.createReadStream(_path+name).pipe(unzip.Extract({path:_path}));
    //出口
    await this.unzipDb(id);
    //this.success(1);
  }

  async unzipDb(id){
    let commit = this.model('commit');
    await commit.dec({id:id},{is_free:1});
  }
}