buildUrl = (data) ->
  scriptUrl = "#{defaultConfig.host}#{defaultConfig.path}#{defaultConfig.site}?"
  if(data.query)
    for key, value of data.query
      scriptUrl += "#{encodeURIComponent(key)}=#{encodeURIComponent(value)}"
  return scriptUrl

addScript = (url) ->
  script = document.createElement('script')
  script.type = 'text/javascript'
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

      describe 'searchpath_getScriptURL()', ->
        it 'should return the proper', ->
          expect(searchpath_getScriptURL()).toEqual(scriptUrl)

      describe 'searchpath_getSite()', ->
        it 'should extract the site URL properly', ->
          expect(searchpath_getSite()).toEqual(defaultConfig.site)

      describe 'searchpath_getParam()', ->
        it 'should properly extract params', ->
          expect(searchpath_getParam('placeholder')).toEqual(defaultConfig.query.placeholder)
        it 'should return a blank string when attempting to extract a non-existent param', ->
          expect(searchpath_getParam('nonsense')).toEqual('')

      describe 'searchpath_getFieldId()', ->
        it 'should return the default if not specified', ->
          expect(searchpath_getFieldId()).toEqual('searchpath_q')

      describe 'searchpath_getTheme()', ->
        it 'should return the default if not specified', ->
          expect(searchpath_getTheme()).toEqual('default')

