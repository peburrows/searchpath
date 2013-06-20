buildUrl = (data) ->
  scriptUrl = "#{defaultConfig.host}#{defaultConfig.path}#{defaultConfig.site}?"
  if(data.query)
    for key, value of data.query
      scriptUrl += "#{encodeURIComponent(key)}=#{encodeURIComponent(value)}"
  return scriptUrl

addScript = (url) ->
  script = document.createElement('script')
  script.type = 'text/test' # setting this to 'text/test' so it doesn't actually get pulled in
  script.src  = url
  document.body.appendChild(script)

defaultConfig =
  host: 'http://js.searchpath.io'
  path: '/v2/'
  site: 'searchpeter.tumblr.com'
  query:
    placeholder: 'search Peter Pan'

describe 'Searchpath', ->
  describe 'the <script/> tag', ->
    describe 'with the default configuration', ->
      scriptUrl = buildUrl(defaultConfig)
      addScript(scriptUrl)
      # this is how we're actually going to test things
      # eventually, we'll expose something like Searchpath.instance or Searchpath[0]
      searchPath = new SearchpathV2()

      describe 'getScriptURL()', ->
        it 'should return the proper value', ->
          expect(searchPath.getScriptURL()).toEqual(scriptUrl)

      describe 'getSite()', ->
        it 'should extract the site URL properly', ->
          expect(searchPath.getSite()).toEqual(defaultConfig.site)

      describe 'getParam()', ->
        it 'should properly extract params', ->
          expect(searchPath.getParam('placeholder')).toEqual(defaultConfig.query.placeholder)
        it 'should return a blank string when attempting to extract a non-existent param', ->
          expect(searchPath.getParam('nonsense')).toEqual('')
        it 'should return a specified default value when attempting to extract a non-existent param', ->
          expect(searchPath.getParam('nothing', 'myDefault')).toEqual('myDefault')
          expect(searchPath.getParam('my-null', null)).toEqual(null)

      describe 'getFieldId()', ->
        it 'should return the default if not specified', ->
          expect(searchPath.getFieldId()).toEqual('searchpath_q')

      describe 'getTheme()', ->
        it 'should return the default if not specified', ->
          expect(searchPath.getTheme()).toEqual('default')


  describe '"class" methods', ->
    it 'should properly report mobile user agent', ->
      mobileUA = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_0 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7A341 Safari/528.16'
      expect(SearchpathV2.isMobile(mobileUA)).toEqual(true)
      expect(SearchpathV2.isMobile('randome')).toEqual(false)