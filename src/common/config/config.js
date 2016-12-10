'use strict';
/**
 * config
 */
export default {
  route_on: true,
  pathname_prefix: "trainee", 
  resource_on: true, // 是否处理静态资源请求， porxy_on 开启下可以关闭该配置
  resource_reg: /^((trainee\/)?static\/|[^\/]+\.(?!js|html)\w+$)/ //静态资源的正则
};