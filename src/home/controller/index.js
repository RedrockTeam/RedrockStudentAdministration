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
		this.display()
	}

	async routeAction(){
		let path = this.getPath(),	//{role: 控制器名，action: 方法名}
				role = path.role,
				action = path.action,
				parterns = {}
		if(this.isPost())
			  parterns.post = this.postParterns()
		parterns.get = this.getParterns()
		this.dispatch(role, action, parterns)
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