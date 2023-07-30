const fs = require("fs");

const axios = require("axios");

class Busquedas {
  historial = ["Perú", "USA"];
  dbPath = "./db/datebase.json";

  constructor() {
    this.leerDB();
  }

  get historialCapitalizado() {
    return this.historial.map( lugar => {

        let exclude = ["del", "de", "la", "da", "el"];
        const titleCase = lugar
        .toLowerCase()
        .split(" ")
        .map((person) => {
            return exclude.includes(person)
            ? person
            : person[0].toUpperCase() + person.slice(1);
        })
        .join(" ");
        
        return titleCase;
    })
  }

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: "es",
    };
  }

  get paramsClima() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: "metric",
      lang: "es",
    };
  }

  async ciudad(lugar = "") {
    try {
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });
      const request = await instance.get();
      return request.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lat: lugar.center[0],
        lgn: lugar.center[1],
      }));
    } catch (error) {
      console.log("Error en la petición");
      return [];
    }
  }

  async clima(lat, lon) {
    try {
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: {
          ...this.paramsClima,
          lat,
          lon,
        },
      });

      const request = await instance.get();
      const { weather, main } = request.data;

      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      console.log("Error en la petición", error);
    }
  }

  agregarHistorial(lugar = "") {
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }

    this.historial = this.historial.splice(0,5);

    this.historial.unshift(lugar.toLocaleLowerCase());

    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };

    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    if (!fs.existsSync(this.dbPath)) {
      return;
    }
    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
    const data = JSON.parse(info);

    this.historial = data.historial;
  }
}

module.exports = Busquedas;
