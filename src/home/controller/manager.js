'use strict';
import Base from './base.js'
import fs from 'fs';
import unzip from 'unzip';
import {res} from '.../function.js'

export default class extends Base {
  /**
  *入口
    {
        path:文件路径
        name: 文件名
    }
  */  
  async index(){
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
        message: "解压成功"
      })
  }


  /**
  *登陆
    {
      name: 用户名
      passwd:密码
    }
  */
  async loginIn() {
    let name = this.post('name');
    let passwd = this.post('passwd');
    let info = await this.model('branch').findManager({
      b_manager: name,
      b_password: passwd
    });
    if (this.isEmpty(info)) {
      return res(400,'用户名或密码错误')
    } else {
      await this.session('managerId',info.id);
      return res(200,'登陆成功');
    }
  }


  /**
  *人员管理
  */
  // async personManage() {
  //   let id = await session('managerId');
  //   let persons =  
  // }

}