'use strict';
import Base from './base.js'
/**
 * 单入口模式,由route过滤以及分发请求
 */
/**	
 * api列表:
 * 
 */
export default class extends Base {

  indexAction(){
		return this.display()
	}

	async routeAction(){
		console.log(1)
		let path = this.getPath(),	//{role: 控制器名，action: 方法名}
				role = path.role,
				action = path.action,
				parterns = {} 
		if(!this.filter(role, action)) return	//是否登录验证
		if(this.isPost())
			  parterns.post = this.postParterns()
		parterns.get = this.getParterns()
		await this.dispatch(role, action, parterns)
	}

	 async filter(role, action){
		 let is_pass = false
		 if(action == 'login')
		 	return true
		 switch (role) {
			 case 'student':
				 if(!await session('stunum'))
				 	this.json({
						'status': 400,
						'message': '请先登录'	 
				 	})
				 else
				 	is_pass = true
				 break;
			 case 'manager':
			 	 if(!await session('managerId'))
				 this.json({
						'status': 400,
						'message': '请先登录'	 
				 })
				 else
				 	is_pass = true
			 	 break;
			 default:
				 this.json({
						'status': 400,
						'message': '没有该角色'	 
				 })
				 break;
		 }
		 return is_pass
	 }

  getPath(){
		return {
			role: this.get().role || null,
			action: this.get().action || null
		}
	}

  getParterns(){
	let res = {}
	for(let item in this.get()){
		if(item == 'role' || item == 'action')
			continue
		res[item] = this.get()[item]
	}
	return res
  }

  postParterns(){
		return this.post()
  }

  async dispatch(role, action, parterns){
		if(!role || !action)
			return this.json({
			status: 400,
			message: "参数不足"
	  })
	  await this.controller(role, 'home')[action](parterns)
  }
  
}