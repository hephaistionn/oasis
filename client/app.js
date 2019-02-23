window.addEventListener('load', () => {

    const ee = require('./kernel/tools/eventemitter');
    const App = require('./kernel/app');
    const screenWorldmap = require('./screenWorldmap');
    const screenMap = require('./screenMap');
    const app = new App(screenMap, screenWorldmap);
    const Stats = require('./kernel/model/stats');

    ee.on('closeScreen', id => {
        app.closeScreen(id);
    });

    ee.on('openScreen', (id, params) => {
        app.openScreen(id, params);
    });

    app.openScreen('ScreenMap', {
        repository: { wood: 15 },
        cityName: 'Poleony',
        goals: {
            score: {prestige: 5},
            building: {House: [1, 2]}, // 2 habitation de niveau 1
            stats: {[Stats.STONE]: 200}
        }
    });
});