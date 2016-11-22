window.location.search.slice(1, -1).split('&').map(function (item) {
  var a = item.split('=')
  return {
    [a[0]]: a[1]
  }
}).reduce(function (prv, nex) {
  return Object.assign({}, prv, nex)
})