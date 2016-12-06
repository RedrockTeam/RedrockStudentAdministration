var uploadObj = (function() {

    var fileInput = createFileInput()

    var fileSize = 100 * 1024

    var uploadContent = $('<div id="cover">\
        <div id="uploadMsg">\
            <h2>正在上传</h2>\
            <div class="progress">\
                <div class="progress-bar" role="progressbar" aria-valuenow="60" \
                    aria-valuemin="0" aria-valuemax="100" style="width: 40%;">\
                    <span class="sr-only">40% 完成</span>\
                </div>\
            </div>\
            <div class="button-outer">\
                <input type="button" class="btn btn-success stop" value="暂停">\
                <input type="button" class="btn btn-danger cancel" value="取消">\
            </div>\
        </div>\
    </div>')

    function createFileInput() {
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        return fileInput;
    }

    function getFiles() {
        return fileInput.files;
    }

    function appendTo(target) {
        target.appendChild(uploadContent[0]);
        uploadObj.hide();
    }

    function createFormData(file, count, endPos, fileSize) {
        var formdata = new FormData();
        formdata.append('peace' + count, file);
        formdata.append('fileName', 'peace' + count);
        formdata.append('fileTime', count);
        formdata.append('branch', 'web研发部');
        formdata.append('hw_id', 1);
        (endPos > fileSize) && formdata.append('complete', true);
        return formdata
    }

    return {

        getFiles: getFiles,
        appendTo: appendTo,
        show: function() {
            var files = getFiles();
            if (!files[0].name.match(/\.zip$/)) {
                alert('文件必须为zip压缩包');
                return false
            }
            uploadContent.show();
            return true
        },
        hide: function() {
            uploadContent.hide();
        },
        showUpload: function() {
            fileInput.click();
        },
        on: function(type, cb) {
            $(fileInput).on(type, cb);
        },
        upload: function(config) {
            var count = config.count;
            var nowPos = config.nowPos;
            var endPos = config.endPos;
            var file = getFiles()[0];
            var data;
            var flag = false;
            if (nowPos + fileSize > file.size) flag = true
            endPos = nowPos + fileSize
            console.log(nowPos, endPos, file.size)
            data = createFormData(file.slice(nowPos, endPos), count ++, endPos, file.size)
            $.ajax({
                url: '/home/index/route?role=student&action=upload',
                type: 'POST',
                cache: false,
                data: data,
                processData: false,
                contentType: false
            }).done(function(res) {
                if(flag) return alert("上传完毕")
                nowPos = endPos
                uploadObj.upload({
                    count: count, 
                    nowPos: nowPos,
                    endPos: endPos
                })
            }).fail(function(res) {
                alert('网络好像出了点问题')
            });
            
            // while(file.size > nowPos) {
            //     if (nowPos + fileSize > file.size)
            //         endPos = file.size
            //     else
            //         endPos = nowPos + fileSize
            //     data = createFormData(file.slice(nowPos, endPos), count ++, endPos, file.size)
            //     $.ajax({
            //         url: '/home/index/route?role=student&action=upload',
            //         type: 'POST',
            //         cache: false,
            //         data: data,
            //         processData: false,
            //         contentType: false
            //     }).done(function(res) {
                    
            //     }).fail(function(res) {

            //     });
            //     nowPos = endPos
            // }
        }
    }
}());