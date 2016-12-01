;(function () {

    window.queryParserMiddleware = function () {
        return function (ctx) {
            ctx.req = {};
            ctx.req.getQuery = getQuery;
        }
    }

    function getQuery () {
        return window.location.search.substring(1).split('&').map(function (item) {
            var a = item.split('=')
            return {
                [a[0]]: a[1]
            }
        }).reduce(function (prv, nex) {
            return Object.assign({}, prv, nex)
        })
    }

}(window));