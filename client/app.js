window.addEventListener('load', () => {

    const ee = require('./kernel/tools/eventemitter');
    const App = require('./kernel/app');
    const screenWorldmap = require('./screenWorldmap');
    const screenMap = require('./screenMap');
    const app = new App(screenMap, screenWorldmap);

    ee.on('closeScreen', id => {
        app.closeScreen(id);
    });

    ee.on('openScreen', (id, params) => {
        app.openScreen(id, params);
    });

    app.openScreen('ScreenMap', {repository:{wood:10}});
});