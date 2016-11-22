function bind () {
    $('.change-score')
        .on('click', function (e) {
            var score = $(this).prev().val();
            if (!score)
                return;
            $.post('/home/index/route?role=manager&action=changeScore', {
                score: score,
                stu_id: $(this).attr('data-id')
            }).then(function (res) {
                if (res.status === 200) {
                    $(this).parent().prev().html(score);
                    alert('修改成功');
                } else {
                    alert('修改失败');
                }
            }.bind(this))
        });
    $('.delete')
        .on('click', function (e) {
            $.get('/home/index/route?role=manager&action=delStu', {
                stu_id: $(e.target).attr('data-id')
            }).then(function (res) {
                if (res.status === 200) {
                    alert('删除成功');
                    $(this).parents('.info').remove();
                } else {
                    alert('删除失败');
                }
            }.bind(this))
        });
}

;(function () {
    bind();
    var menuitemlist = $('.menuitem');
    var peopleContainer = $('.people-container');

    menuitemlist.on('click', function (e) {
        e.preventDefault();
        $.get('/home/index/route?role=manager&action=personManage', {
            type: $(e.target).attr('data-type'),
            page: '1',
        })
            .then(function (res) {
                peopleContainer.html(
                    renderList(res.pageMessage.data)
                );
            })
    })

    function renderList (data) {
        var mid = Handlebars.compile(
            '{{#data}}\
                <tr class="info">\
                    <th>\
                        <input type="checkbox" name="">\
                    </th>\
                    <td>\
                        {{ student.stu_name }}\
                    </td>\
                    <td>\
                        {{ student.stu_num }}\
                    </td>\
                    <td>\
                        {{ student.stu_academy }}\
                    </td>\
                    <td>\
                        {{ sb_score }}\
                    </td>\
                    <td>\
                        <button type="button" class="btn btn-default download">修改分数</button>\
                        <button type="button" class="btn btn-default download">删除</button>\
                    </td>\
                </tr>\
                {{/data}}'
        );
        var tpl = mid({
            data: data
        });
        return tpl;
    }
}())
