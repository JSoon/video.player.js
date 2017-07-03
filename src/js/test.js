var domId = 'J_Video'; // 视频所在容器的id
var playerId = 'ckplayer_' + domId; // 播放器id
var video = $('#' + domId); // 播放器容器
var videoBarBottom = $('#J_VideoBarBottom'); // 播放器底部工具栏

// 检测flash player安装情况
if (!CKobject.Flash()['f'] || parseInt(CKobject.Flash()['v']) < 11) {
    var info = '<div class="no-flash">\
        您没有安装Flash或者Flash版本较低，\
        <a href="https://get.adobe.com/cn/flashplayer/" target="_blank">\
        请点击此处下载安装最新的Flash插件\
        </a>\
        </div>';
    alert(info);
}

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
        domId: 'J_Video'
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
            // autoPlay: 1,
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

    // 控制栏
    var controlOpenBtn = $('<button type="button" id="J_ControlOpen">打开底部控制栏</button>');
    var controlCloseBtn = $('<button type="button" id="J_ControlClose">关闭底部控制栏</button>');

    // 滚动文字广告
    var marqueeOpenBtn = $('<button type="button" id="J_MarqueeOpen">打开滚动文字广告</button>');
    var marqueeCloseBtn = $('<button type="button" id="J_MarqueeClose">关闭滚动文字广告</button>');

    // 贴片广告
    var stickerAdLoadBtn = $('<button type="button" id="J_StickerAdLoad">加载贴片广告</button>');
    var stickerAdCloseBtn = $('<button type="button" id="J_StickerAdClose">关闭贴片广告</button>');

    // 暂停广告
    var pauseAdLoadBtn = $('<button type="button" id="J_PauseAdLoad">加载暂停广告</button>');
    var pauseAdCloseBtn = $('<button type="button" id="J_PauseAdClose">关闭暂停广告</button>');

    // 弹幕
    var barrageInput = $('<input type="text" id="J_BarrageInput" />');

    videoBarBottom.html('')
        .append(screenBtn)
        .append(reloadBtn)
        .append(destroyBtn)
        .append(controlOpenBtn)
        .append(controlCloseBtn)
        .append('<br>')
        .append(marqueeOpenBtn)
        .append(marqueeCloseBtn)
        .append('<br>')
        .append(stickerAdLoadBtn)
        .append(stickerAdCloseBtn)
        .append(pauseAdLoadBtn)
        .append(pauseAdCloseBtn)
    // .append(barrageInput);

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
        videoBarBottom.html('');
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

    /**
     * 底部控制栏
     */
    controlOpenBtn.on('click', function () {
        myVideoPlayer.changeFace(false);
    });
    controlCloseBtn.on('click', function () {
        myVideoPlayer.changeFace(true);
    });

    /**
     * 滚动文字广告
     */
    marqueeOpenBtn.on('click', function () {
        myVideoPlayer.marqueeLoad('滚动文字广告展示');
    });
    marqueeCloseBtn.on('click', function () {
        myVideoPlayer.marqueeClose();
    });

    /**
     * 贴片广告
     */
    stickerAdLoadBtn.on('click', function () {
        myVideoPlayer.stickerAdLoad('https://www.baidu.com/img/bd_logo1.png', 'http://www.baidu.com');
    });
    stickerAdCloseBtn.on('click', function () {
        myVideoPlayer.stickerAdClose();
    });

    /**
     * 暂停广告
     */
    pauseAdLoadBtn.on('click', function () {
        myVideoPlayer.pauseAdLoad('https://www.baidu.com/img/bd_logo1.png', 'http://www.baidu.com');
    });
    pauseAdCloseBtn.on('click', function () {
        myVideoPlayer.pauseAdClose();
    });

    /**
     * 发送弹幕
     */
    // barrageInput.on('keyup', function (e) {
    //     // 点击回车
    //     if (e.which == 13) {
    //         myVideoPlayer.textBoxShow({
    //             name: 'textboxname', //该文本元件的名称，主要作用是关闭时需要用到
    //             coor: '0,2,-100,-100', //坐标
    //             text: '{font color="#000" size="12" face="Microsoft YaHei,微软雅黑"}弹幕1号{/font}',
    //             bgAlpha: 0, //背景透明度
    //             tween: [
    //                 ['x', 1, 700, 1]
    //             ]
    //         });
    //     }
    // });
}