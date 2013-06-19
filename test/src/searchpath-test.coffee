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
  document.head.appendChild(script)

defaultConfig =
  host: 'http://js.searchpath.io'
  path: '/v1/'
  site: 'searchpeter.tumblr.com'
  query:
    placeholder: 'search Peter Pan'

describe 'Searchpath', ->
  describe 'the <script/> tag', ->
    describe 'with the default configuration', ->
      scriptUrl = buildUrl(defaultConfig)
      addScript(scriptUrl)

      describe 'getScriptURL()', ->
        it 'should return the proper', ->
          expect(Searchpath.getScriptURL()).toEqual(scriptUrl)

      describe 'getSite()', ->
        it 'should extract the site URL properly', ->
          expect(Searchpath.getSite()).toEqual(defaultConfig.site)

      describe 'getParam()', ->
        it 'should properly extract params', ->
          expect(Searchpath.getParam('placeholder')).toEqual(defaultConfig.query.placeholder)
        it 'should return a blank string when attempting to extract a non-existent param', ->
          expect(Searchpath.getParam('nonsense')).toEqual('')
        it 'should return a specified default value when attempting to extract a non-existent param', ->
          expect(Searchpath.getParam('nothing', 'myDefault')).toEqual('myDefault')
          expect(Searchpath.getParam('my-null', null)).toEqual(null)

      describe 'getFieldId()', ->
        it 'should return the default if not specified', ->
          expect(Searchpath.getFieldId()).toEqual('searchpath_q')

      describe 'getTheme()', ->
        it 'should return the default if not specified', ->
          expect(Searchpath.getTheme()).toEqual('default')

