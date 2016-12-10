
function bindDownload () { // 下载相关

    var checkboxlist = $('.check-one');
    var downloadAll = $('.download-all')
    var downloadArr = [];

    $('#chooseAll').on('click', function () {
        checkboxlist.each(function (index, item) {
            if (this.checked !== item.checked)
                item.click()
        }.bind(this))
    })

    downloadAll.on('click', function () {
        downloadArr.forEach(function (item) {
            $(item)
                .parents('.info')
                .find('.download')[0]
                .click()
        })
    })

    checkboxlist.on('change', function () {
        if (this.checked) {
            downloadArr.push(this)
        } else {
            downloadArr.splice(
                downloadArr.indexOf(this),
                1
            )
        }
        if (downloadArr.length === 0) {
            downloadAll.hide()
        } else {
            downloadAll.show()
        }
    })
}

;(function () {
    bindDownload()
    var menuitemlist = $('.menuitem');
    var lessonContainer = $('.lesson-container');

    menuitemlist.on('click', function (e) {
        e.preventDefault();
        $.get('/home/index/route?role=student&action=getCourseWare&b_id=' + $(this).attr('data-b_id'))
            .then(function (res) {
                lessonContainer.html(
                    renderList(res.courseWare)
                );
                bindDownload();
            })
    })

    function renderList (data) {
        var mid = Handlebars.compile(
            '{{#courseWare}}\
                <tr class="info">\
                    <th>\
                        <input type="checkbox" class="check-one">\
                    </th>\
                    <td>\
                        {{ cw_branch }}\
                    </td>\
                    <td>\
                        {{ cw_title }}\
                    </td>\
                    <td>\
                        {{ cw_detail }}\
                    </td>\
                    <td>\
                        {{ cw_time }}\
                    </td>\
                    <td>\
                        <a download="{{ cw_place }}" href="{{ cw_place }}" class="btn btn-default download">下载</a>\
                    </td>\
                </tr>\
            {{/courseWare}}'
        );
        var tpl = mid({
            courseWare: data
        });
        return tpl;
    }
}())
