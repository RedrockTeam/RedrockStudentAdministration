'use strict';
/**
 * config
 */
export default {
  route_on: true,
  pathname_prefix: "trainee", 
  resource_reg: /^((trainee\/)?static\/|[^\/]+\.(?!js|html)\w+$)/ //静态资源的正则
};