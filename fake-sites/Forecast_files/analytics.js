var _gaq =  [ ["_setAccount", "UA-27611241-6"], ["_trackPageview"] ]

;(function(d,t) {

  var g = d.createElement(t),
      s = d.getElementsByTagName(t)[0]
      g.async = 1

  g.src = ("https:" == location.protocol ? "//ssl" : "//www") + ".google-analytics.com/ga.js"

  s.parentNode.insertBefore(g,s)

} (document, "script"))

$(function() {
  $("a").on('click',function(e){
    var url = $(this).attr("href")
    if (e.currentTarget.host != window.location.host) {
      _gat._getTrackerByName()._trackEvent("Outbound Links", e.currentTarget.host.replace(':80',''), url, 0)
      if (e.metaKey || e.ctrlKey || $(this).attr("target") == "_blank") {
        var newtab = true
      }
      if (!newtab) {
        e.preventDefault()
        setTimeout('document.location = "' + url + '"', 100)
      }
    }
  })
})

var _gauges = _gauges || [];
(function() {
  var t   = document.createElement('script');
  t.type  = 'text/javascript';
  t.async = true;
  t.id    = 'gauges-tracker';
  t.setAttribute('data-site-id', '51645b22108d7b0eea000005');
  t.src = '//secure.gaug.es/track.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(t, s);
})();