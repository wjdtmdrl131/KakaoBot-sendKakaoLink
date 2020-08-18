// Made by 정승기 (Thanks for BelBone)
var CryptoJS = require('./crypto').CryptoJS;

exports.Kakao = function() {
  function Kakao() {
    this.apiKey = null;
    this.cookies = {};
    this.loginReferer = null;
    this.cryptoKey = null;
    this.parsedTemplate = null;
    this.csrf = null;
    this.id = null;
    this.securityKey = null;
  }
  Kakao.prototype.init = function(apiKey) {
    if (typeof apiKey != 'string' || apiKey.length != 32) {
      throw new TypeError('API 키 ' + apiKey + ' 는 올바르지 않은 API 키 입니다.');
    }
    this.apiKey = apiKey;
    return true;
  }
  Kakao.prototype.isInitalized = function() {
    if (this.apiKey == null) {
      return false;
    } else {
      return true;
    }
  }
  Kakao.prototype.static = {
    kakaoAgent: 'sdk/1.36.6 os/javascript lang/en-US device/Win32 origin/http%3A%2F%2Fmagenta.kro.kr',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
    contentType: 'application/x-www-form-urlencoded'
  }
  Kakao.prototype.authApiKey = function() {
    var authdata = {
      app_key: this.apiKey,
      validation_action: 'default',
      validation_params: '{}',
      ka: this.static.kakaoAgent,
      lcba: ''
    };
    var response = org.jsoup.Jsoup.connect("https://sharer.kakao.com/talk/friends/picker/link").header("User-Agent", this.static.userAgent).data(authdata).method(org.jsoup.Connection.Method.POST).execute();
    if(response.statusCode() == 401) {
      throw new Error('API 키가 올바르지 않습니다. API 키를 다시 확인해주세요.');
    }
    if(response.statusCode() != 200) {
      throw new Error('API키 인증 중 오류가 발생하였습니다.\n' + e);
    }
    var parsedata = response.parse();
    var urldata = response.url();
    Object.assign(this.cookies, {
      _kadu: response.cookie('_kadu'),
      _kadub: response.cookie('_kadub'),
      _maldive_oauth_webapp_session: response.cookie('_maldive_oauth_webapp_session')
    });
    this.cryptoKey = parsedata.select('input[name=p]').attr('value');
    this.loginReferer = urldata.toString();
  }
  Kakao.prototype.getTiaraCookie = function() {
    var response = org.jsoup.Jsoup.connect('https://track.tiara.kakao.com/queen/footsteps').ignoreContentType(true).execute();
    this.cookies.TIARA = response.cookie('TIARA');
  }
  Kakao.prototype.login = function(email, password) {
    if (this.isInitalized() == true) {
      this.authApiKey();
      this.getTiaraCookie();
    } else {
      throw new Error('login 메소드가 SDK 를 초기화 하기 전에 호출되었습니다.');
    }
    if (typeof email != 'string') {
      throw new Error('email 이 string 타입이 아닙니다.');
    }
    if (typeof password != 'string') {
      throw new Error('password 이 string 타입이 아닙니다.');
    }
    var logindata = {
      os: 'web',
      webview_v: '2',
      email: CryptoJS.AES.encrypt(email, this.cryptoKey).toString(),
      password: CryptoJS.AES.encrypt(password, this.cryptoKey).toString(),
      continue: decodeURIComponent(this.loginReferer.split('continue=')[1]),
      third: 'false',
      k: 'true'
    };
    var response = org.jsoup.Jsoup.connect('https://accounts.kakao.com/weblogin/authenticate.json').header("User-Agent", this.static.userAgent).header('Referer', this.loginReferer).cookies(this.cookies).data(logindata).ignoreContentType(true).method(org.jsoup.Connection.Method.POST).execute();
    var status = JSON.parse(response.body()).status;
    if (status == -450) {
      throw new ReferenceError('email이나 password가 올바르지 않습니다. email과 password를 다시 확인해주세요.');
    }
    if(status != 0) {
      throw new Error('로그인 중 에러가 발생하였습니다.\n' + response.body());
    }
    Object.assign(this.cookies, {
      _kawlt: response.cookie('_kawlt'),
      _kawltea: response.cookie('_kawltea'),
      _karmt: response.cookie('_karmt'),
      _karmtea: response.cookie('_karmtea')
    });
  }
  Kakao.prototype.templateCheck = function(template, type) {
    var cookiedata = {
      TIARA: this.cookies.TIARA,
      _kawlt: this.cookies._kawlt,
      _kawltea: this.cookies._kawltea,
      _karmt: this.cookies._karmt,
      _karmtea: this.cookies._karmtea
    };
    var templatecheckdata = {
      app_key: this.apiKey,
      validation_action: type,
      validation_params: JSON.stringify(template),
      ka: this.static.kakaoAgent,
      lcba: ''
    };
    var response = org.jsoup.Jsoup.connect('https://sharer.kakao.com/talk/friends/picker/link').header('User-Agent', this.static.userAgent).header('Referer', this.loginReferer).cookies(cookiedata).data(templatecheckdata).method(org.jsoup.Connection.Method.POST).ignoreHttpErrors(true).execute();
    if(response.statusCode() == 400) {
      throw new Error('템플릿 객체가 올바르지 않습니다. 타 도메인이 있는 경우 카카오 개발자 설정에서 해당 Url을 추가해주세요.');
    }
    Object.assign(this.cookies, {
      KSHARER: response.cookie('KSHARER'),
      using: 'true'
    });
    var parsedata = response.parse();
    this.parsedTemplate = JSON.parse(parsedata.select('#validatedTalkLink').attr('value'));
    this.csrf = parsedata.select('div').last().attr('ng-init').split('\'')[1];
  }
  Kakao.prototype.getRooms = function() {
    var response = org.jsoup.Jsoup.connect('https://sharer.kakao.com/api/talk/chats').header('User-Agent', this.static.userAgent).header('Referer', 'https://sharer.kakao.com/talk/friends/picker/link').header('Csrf-Token', this.csrf).header('App-Key', this.apiKey).cookies(this.cookies).ignoreContentType(true).execute();
    var doc = response.body().replace(/\u200b/g,'');
    return JSON.parse(doc);
  }
  Kakao.prototype.roomCheck = function(roomTitle) {
    var rooms = this.getRooms();
    for(let room of rooms.chats) {
      if(room.title == roomTitle) {
        this.id = room.id;
        this.securityKey = rooms.securityKey;
        break;
      }
    }
    if (this.id != null) {
      return true;
    } else {
      return false;
    }
  }
  Kakao.prototype.sendKakaoLink = function(roomTitle, template, type) {
    this.templateCheck(template, type);
    if (this.roomCheck(roomTitle) == true) {
      var cookiedata = {
        KSHARER: this.cookies.KSHARER,
        TIARA: this.cookies.TIARA,
        using: this.cookies.using,
        _kadu: this.cookies._kadu,
        _kadub: this.cookies._kadub,
        _kawlt: this.cookies._kawlt,
        _kawltea: this.cookies._kawltea,
        _karmt: this.cookies._karmt,
        _karmtea: this.cookies._karmtea
      };
      var senddata = JSON.stringify({
        receiverChatRoomMemberCount: [1],
        receiverIds: [this.id],
        receiverType: 'chat',
        securityKey: this.securityKey,
        validatedTalkLink: this.parsedTemplate
      });
      var response = org.jsoup.Jsoup.connect('https://sharer.kakao.com/api/talk/message/link').header('User-Agent', this.static.userAgent).header('Referer', 'https://sharer.kakao.com/talk/friends/picker/link').header('Csrf-Token', this.csrf).header('App-Key', this.apiKey).header('Content-Type', 'application/json;charset=UTF-8').cookies(cookiedata).requestBody(senddata).ignoreContentType(true).ignoreHttpErrors(true).method(org.jsoup.Connection.Method.POST).execute();
      this.id = null;
      return true;
    } else {
      throw new Error('방제목이 올바르지 않습니다. ' + roomTitle);
    }
  }

  return Kakao;
}
