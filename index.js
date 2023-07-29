require('dotenv').config();

const { inquirerMenu, pausa, leerInput, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
    const busquedas = new Busquedas();
  let opt;
  
  do {
    opt = await inquirerMenu();

    switch (opt) {
        case 1:
            const terminos = await leerInput('Ciudad: ');
           
            // Buscar los lugares
            const lugares = await busquedas.ciudad(terminos);

            // Seleccionar el llugar
            const id = await listarLugares(lugares);
            if( id === '0' ) continue;

            const lugarSel = lugares.find( l => l.id === id);

            // Guardar en DB
            busquedas.agregarHistorial( lugarSel.nombre );
            
            // Clima
            const clima = await busquedas.clima(lugarSel.lat, lugarSel.lgn);
            const { desc, min, max, temp } = clima;

            console.clear();
            console.log('\nInformación de la ciudad\n'.green);
            console.log('Ciudad:', lugarSel.nombre);
            console.log('Lat:', lugarSel.lat);
            console.log('Lgn:', lugarSel.lgn);
            console.log("Temperatura:", temp)
            console.log("Minima:", min)
            console.log("Maxima:", max)
            console.log("Cómo esta el clima:", desc)
            break;

        case 2:
                busquedas.historialCapitalizado.forEach( (lugar, i) => {
                    const idx = `${ i + 1 }.`.green;
                    console.log(`${ idx } ${ lugar }`)
                })
            break;
    
        default:
            break;
    }
    console.log({ opt });

    if (opt !== 0) {
      await pausa();
    }
  } while (opt !== 0);
};

main();
