# sendKakaoLink
카카오링크 전송   
+ -484 오류를 고쳤어요! 사실 발견한지는 좀 지났는데.. 사정이 좀 있어서 늦게 업로드 되었어요!   
- 유용하셨다면, 다들 스타 한번씩 눌러주세요..

# exmaple
```
const kakaoLinkModule = require('KakaoLink').Kakao();
const kakao = new kakaoLinkModule;
kakao.init('4d545a185d172754667d621049004aa1'); // api key
kakao.login('email', 'password');

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  if (msg.startsWith('멜론 ')) {
    var doc = org.jsoup.Jsoup.parse(Utils.getWebText('https://m.search.daum.net/search?w=music&m=song&nil_search=btn&DA=NTB&q=' + msg.substr(3)));
    var title = doc.select('strong.tit-g').eq(0).text();
    var artist = doc.select('p.desc').eq(0).text();
    var img = doc.select('img').attr('data-original-src');
    var id = doc.select('a').attr('data-song-id');
    var data = {
      'link_ver': '4.0',
      'template_id': 10546,
      'template_args': {
      'THUMB_URL': img,
      'TITLE': title,
      'SUB_TITLE': artist,
      'SONG_ID': id}
    };
    kakao.sendKakaoLink(room, data, 'custom');
  }
}
```
