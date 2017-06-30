var domId = 'J_Video'; // 视频所在容器的id
var playerId = 'ckplayer_' + domId; // 播放器id
var video = $('#' + domId); // 播放器容器
var videoBarBottom = $('#J_VideoBarBottom'); // 播放器底部工具栏

/**
 * mp4
 */
$('#J_PlayMp4').click(function () {

    // 播放器参数初始化
    var opts = {
        url: 'http://218.200.230.11:8080/video/migu_16.mp4',
        preAdTime: 30
    };

    // 创建播放器
    var myVideoPlayer = videoPlayer({
        domId: 'J_Video',
        onPlay: function (vp) {
            console.log(vp);
        },
        onPlayerLoad: function (vp) {
            vp.playOrPause();
            // console.log(vp.getStatus());
        }
    });

    // 初始化播放器
    myVideoPlayer.init(opts);

    initControlBar(myVideoPlayer);
});

/**
 * m3u8直播
 */
$('#J_PlayLive').click(function () {

    // 获取m3u8直播流
    $.ajax({
        method: 'GET',
        url: '/player/player/queryPlayerAllInfo',
        data: {
            /**
             * 关联视讯: 627514646
             * 5.24迪玛希生日会（能进）
             * GET http://vod.cdn6.cmvideo.cn/crossdomain.xml 200
             * http://vod.cdn6.cmvideo.cn/depository/asset/zhengshi/5101/006/276/5101006276/media/5101006276_5001087112_55.mp4.m3u8?msisdn=40121555156101511415430092930107&spid=600226&sid=5500279516&pid=2028593040&Channel_ID=0119_04102000-99000-200900260000000&ProgramID=627514646&client_ip=10.0.30.254&assertID=5101006276&partnerid=1001621&AdCodeNum=55&AdFlag=0&VideoType=vod&timestamp=20170622150153&encrypt=b680fcdd8ec311a8389abb42f7ed49dc
             */
            // sourceId: 627514646,
            /**
             * 关联视讯: 622777937
             * 咪咕汇明星采访间（不能进）
             * GET http://vod.migu.cn/crossdomain.xml 404 (Not Found)
             * http://vod.migu.cn/KRqkeJOXJCzls1wfy8sKO7LYhR0AbuYG1Aqk1Nk607NiX7/D8W5s1ni98agh5oReYOY89cdqos0YWDsDPCOwupltoZenT6yEYAG+YxQS2oTnSkQv1755Di7y906jDG10Gel79DbGAbQqDI3QbAvfySFgN2AxhkfiqvvONepSmGgzcgdZlMH7qqzAm7XEFAJu/%E4%B8%80%E7%B2%92%E7%B3%96-%E4%BE%A7%E7%94%B0.mp4?msisdn=2a257d4c-1ee0-4ad8-8081-b1650c26390a&spid=600906&sid=36880813173002&timestamp=20170622150547&encrypt=13b33045904fd54150469a567bb48f2c&k=218488e6eb558dc6&t=1498122347679&ec=1&FN=%E4%B8%80%E7%B2%92%E7%B3%96
             */
            // sourceId: 622777937,
            sourceId: 'clientTest',
            currentPlayType: 2,
            via: 'website', // ckplayer专用接口属性
            width: 1440,
            height: 900,
        }
    }).then(function (res) {
        res = JSON.parse(res);

        // 获取并设置清晰度
        var defs = res.data.videoBitrates;
        var defTexts = []; // 清晰度文本
        var defFiles = []; // 清晰度视频url

        if (defs.SD) {
            defTexts.push('标清');
            defFiles.push(defs.SD.url);
        }
        if (defs.HD) {
            defTexts.push('高清');
            defFiles.push(defs.HD.url);
        }
        if (defs.BD) {
            defTexts.push('超清');
            defFiles.push(defs.BD.url);
        }

        // 播放器参数初始化
        var opts = {
            m3u8: true,
            live: true,
            url: defs.SD.url,
            // url: 'http://218.200.230.11:8080/video/migu_16.mp4',
            preAdTime: 30,
            defTexts: defTexts.join(','),
            defFiles: defFiles.join('|')
        };

        // 创建播放器
        var myVideoPlayer = videoPlayer({
            domId: 'J_Video'
        });

        // 初始化播放器
        myVideoPlayer.init(opts);

        initControlBar(myVideoPlayer);
    });

});

/**
 * m3u8回播
 */
$('#J_PlayReplay').click(function () {

    // 获取m3u8直播流
    $.ajax({
        method: 'GET',
        url: '/player/player/queryPlayerAllInfo',
        data: {
            /**
             * 关联视讯: 627514646
             * 5.24迪玛希生日会（能进）
             * GET http://vod.cdn6.cmvideo.cn/crossdomain.xml 200
             * http://vod.cdn6.cmvideo.cn/depository/asset/zhengshi/5101/006/276/5101006276/media/5101006276_5001087112_55.mp4.m3u8?msisdn=40121555156101511415430092930107&spid=600226&sid=5500279516&pid=2028593040&Channel_ID=0119_04102000-99000-200900260000000&ProgramID=627514646&client_ip=10.0.30.254&assertID=5101006276&partnerid=1001621&AdCodeNum=55&AdFlag=0&VideoType=vod&timestamp=20170622150153&encrypt=b680fcdd8ec311a8389abb42f7ed49dc
             */
            sourceId: 627514646,
            /**
             * 关联视讯: 622777937
             * 咪咕汇明星采访间（不能进）
             * GET http://vod.migu.cn/crossdomain.xml 404 (Not Found)
             * http://vod.migu.cn/KRqkeJOXJCzls1wfy8sKO7LYhR0AbuYG1Aqk1Nk607NiX7/D8W5s1ni98agh5oReYOY89cdqos0YWDsDPCOwupltoZenT6yEYAG+YxQS2oTnSkQv1755Di7y906jDG10Gel79DbGAbQqDI3QbAvfySFgN2AxhkfiqvvONepSmGgzcgdZlMH7qqzAm7XEFAJu/%E4%B8%80%E7%B2%92%E7%B3%96-%E4%BE%A7%E7%94%B0.mp4?msisdn=2a257d4c-1ee0-4ad8-8081-b1650c26390a&spid=600906&sid=36880813173002&timestamp=20170622150547&encrypt=13b33045904fd54150469a567bb48f2c&k=218488e6eb558dc6&t=1498122347679&ec=1&FN=%E4%B8%80%E7%B2%92%E7%B3%96
             */
            // sourceId: 622777937,
            // sourceId: 'clientTest',
            currentPlayType: 2,
            via: 'website', // ckplayer专用接口属性
            width: 1440,
            height: 900,
        }
    }).then(function (res) {
        res = JSON.parse(res);

        // 获取并设置清晰度
        var defs = res.data.videoBitrates;
        var defTexts = []; // 清晰度文本
        var defFiles = []; // 清晰度视频url

        if (defs.SD) {
            defTexts.push('标清');
            defFiles.push(defs.SD.url);
        }
        if (defs.HD) {
            defTexts.push('高清');
            defFiles.push(defs.HD.url);
        }
        if (defs.BD) {
            defTexts.push('超清');
            defFiles.push(defs.BD.url);
        }

        // 播放器参数初始化
        var opts = {
            m3u8: true,
            live: false,
            url: defs.SD.url,
            preAdTime: 30,
            defTexts: defTexts.join(','),
            defFiles: defFiles.join('|')
        };

        // 创建播放器
        var myVideoPlayer = videoPlayer({
            domId: 'J_Video'
        });

        // 初始化播放器
        myVideoPlayer.init(opts);

        initControlBar(myVideoPlayer);
    });

});

// 生成播放器控制工具栏
function initControlBar(myVideoPlayer) {
    var screenBtn = $('<button type="button" id="J_ScreenMode">正常/影院模式切换</button>');
    var reloadBtn = $('<button type="button" id="J_Reload">重载视频</button>');
    var destroyBtn = $('<button type="button" id="J_Destroy">清除视频</button>');

    videoBarBottom.html('').append(screenBtn).append(reloadBtn).append(destroyBtn);

    /**
     * 重新加载视频
     */
    reloadBtn.on('click', function () {
        myVideoPlayer.reload();
    });

    /**
     * 清除视频
     */
    destroyBtn.on('click', function () {
        myVideoPlayer.destroy();
        screenBtn.remove();
        reloadBtn.remove();
        destroyBtn.remove();
    });

    /**
     * 正常（小屏）/影院模式（宽屏）切换
     */
    screenBtn.on('click', function () {
        // console.log(myVideoPlayer.player.o);
        var playerDom = $(myVideoPlayer.player.o);
        playerDom.toggleClass('theater');
        if (playerDom.hasClass('theater')) {
            myVideoPlayer.setVideoWH(1200, 600);
        } else {
            myVideoPlayer.setVideoWH(600, 400);
        }
    });
}