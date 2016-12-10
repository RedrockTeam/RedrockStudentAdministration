;(function () {
    if (typeof Handlebars == undefined) throw 'this middleware is depend on handlebars';
    var conf,
        data, target, clearhead, scriptLoader, styleLoader, transform;
    var rootLocation;
    function getRender (ctx) {
        return function (path /* , DOM || obj */) {
            if (path[0] === '.') path = rootLocation + '/' + path;
            conf = arguments[1];
            data = conf.data; // html变量
            target = conf.target; // 目标元素
            clearhead = conf.clearhead; // 是否清除头部的js和css
            scriptLoader = conf.scriptLoader; // 预编译javascript
            styleLoader = conf.styleLoader; // 预编译css
            transform = conf.transform; // 自定义组件如何插入
            return ctx.load(path)
                .then(function (html) {
                    html = _compileHTML(html, data);
                    var htmlDOM = _createHTMLDOM(html);
                    var headChildNodes = ctx._getHead(htmlDOM, path);
                    var bodyChildNodes = ctx._getCompont(htmlDOM, path);
                    return {
                        headChildNodes: headChildNodes, 
                        bodyChildNodes: bodyChildNodes
                    };
                }).then(function (childNodes) {
                    var headCompont, bodyCompont;
                    headCompont = _createFrg(childNodes.headChildNodes);
                    bodyCompont = _createFrg(childNodes.bodyChildNodes);
                    ctx.routeObj.shouldDoDesFn = true;
                    ctx.routeObj.getCompont = function () {
                        return {
                            headChildNodes: headChildNodes, 
                            bodyChildNodes: bodyChildNodes
                        }; 
                    }
                    ctx.routeObj.desFn = function () {
                        childNodes.headChildNodes.forEach(function (item) {
                            item.parentNode.removeChild(item);
                        });
                        childNodes.bodyChildNodes.forEach(function (item) {
                            item.parentNode && item.parentNode.removeChild(item);
                        });
                    };
                    if (conf.nodeName) target = conf;
                    if (!target) throw 'there need a DOM or a obj.target to render the compont';
                    if (clearhead) _clearhead();
                    document.head.appendChild(headCompont);
                    if (transform) {
                        if (typeof transform !== 'function') throw 'transform should be a function';
                        ctx.routeObj.shouldDoDesFn = false;
                    } else {
                        target.innerHTML = '';
                        target.appendChild(bodyCompont);
                    }
                    return target;
                });
        }
    }
    function _compile (loader) {
        return function (src) {
            return loader(src);
        }
    }
    function _createHTMLDOM (htmlstring) {
        var html = document.createElement('html');
        html.innerHTML = htmlstring.replace(/(?:^\s*<html\s*>)|(?:<\/html\s*>\s*$)/g, '');
        return html;
    }
    function _compileHTML (htmlstring, data) {
        return Handlebars.compile(htmlstring)(data || {});
    }
    function _clearhead () {
        var head = document.head;
        var childrenArray = [].slice.call(head.children);
        childrenArray.forEach(function (item) {
            if (item.nodeName === 'SCRIPT' || item.nodeName === 'STYLE' || item.nodeName === 'LINK') {
                head.removeChild(item);
            }
        });
    }
    function _createFrg (childNodes) {
        var frg = document.createDocumentFragment();
        var childNodesArray = [].slice.call(childNodes);
        childNodesArray.forEach(function (item) {
            if (item.nodeName === 'STYLE' && typeof styleLoader === 'function') 
                item.innerHTML = styleLoader(item.innerHTML);
            if (item.nodeName === 'SCRIPT') {
                var tmp = document.createElement('script');
                for (var key in item.attributes) {
                    var attr = item.attributes[key]
                    if (attr) {
                        tmp[attr.name] = attr.value
                    }
                }
                if (!item.src)
                    tmp.innerHTML = '(function() {' + item.innerHTML + '}())';
                if (typeof scriptLoader === 'function ') {
                    tmp.innerHTML = scriptLoader(item.innerHTML);
                }
                item = tmp;
            }
            frg.appendChild(item);
        });
        return frg;
    }
    function routeHbsMiddleware (location) {
        rootLocation = location;
        return function (ctx) {
            if (ctx.render) throw 'there are two render function in ctx';
            ctx.render = getRender(ctx);
        }
    }
    if (typeof module === 'object' && module.exports && exports) {
        module.exports = routeHbsMiddleware;
    } else {
        window.routeHbsMiddleware = routeHbsMiddleware;
    }
}(window, document));