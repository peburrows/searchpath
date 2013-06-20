describe 'Searchpath Events', ->
  describe 'SearchpathV2.trigger', ->
    beforeEach ->
      @searchPath = new SearchpathV2()

    it 'should add handlers properly', ->
      eventName = 'random:event'
      @searchPath.on eventName, (data) ->
        return '';
      expect(@searchPath.getHandlers(eventName).length).toEqual(1)

    it 'should trigger events properly', ->
      handlers = func: ()->
      spyOn(handlers, 'func')
      eventName = 'trigger:event'
      @searchPath.on(eventName, handlers.func)
      @searchPath.trigger(eventName)
      expect(handlers.func).toHaveBeenCalled()

    describe 'when triggering events before handlers have been set', ->
      beforeEach ->
        @eventName = 'event:before'
        @eventData = 'mydata'
        @searchPath.trigger(@eventName, @eventData)

      it 'should call a handler immediately when adding it', ->
        handlers = func: ()->
        spyOn(handlers, 'func')
        @searchPath.on(@eventName, handlers.func)
        expect(handlers.func).toHaveBeenCalledWith(@eventData)

    describe 'when triggering events on the "class"', ->
      it 'should call the handlers on all instances', ->
        handlers = func: ()->
        spyOn(handlers, 'func')
        eventName = 'class:event'
        @searchPath.on(eventName, handlers.func)
        SearchpathV2.trigger(eventName)
        expect(handlers.func).toHaveBeenCalled()

      describe 'before an instance has been created', ->
        classEventName = 'class:before:event'
        SearchpathV2.trigger(classEventName)

        it 'should trigger immediately on handler creation', ->
          handler = func: ()->
          newSP = new SearchpathV2()
          spyOn(handler, 'func')
          newSP.on(classEventName, handler.func)
          expect(handler.func).toHaveBeenCalled()




