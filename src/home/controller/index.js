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
		let path = this.getPath()
		let contoller = this.controller(path.role, 'home')
		switch (contoller) {
			case value:
				
				break;
		
			default:
				break;
		}
	}
	
}