# Rpi-SK6812-ws2812b-RGBW-http-server

This is an express server that expose an API to drive SK6812/ws2812b RGBW LED strips on a Raspberry Pi

## Hardware Install

1. Plug the +5V and GND in an external power supply.

2. Plug the DATA and GND in your Raspberry Pi.

3. The default data pin is GPIO18 (which is #12 on the circuit board).

## Software Install

Just run the server with:

```sh
npm install
npm start
```

## API

Do an HTTP POST with this JSON body:

```json
{
    "colors": [
        { "r": 255, "g": 255, "b": 255, "w": 255 },
        { "r": 255, "g": 0, "b": 0, "w": 0 },
        { "r": 0, "g": 255, "b": 0, "w": 0 },
        { "r": 0, "g": 0, "b": 255, "w": 0 },
        { "r": 0, "g": 0, "b": 0, "w": 255 }
    ]
}
```

_With as many element in the array as your LED strip is. Usually 30, **60** or 120 LED/m_

### curl Example

```sh
curl -X POST \
  http://<raspberry-ip-address>:13334 \
  -H 'Content-Type: application/json' \
  -d '{ "colors": [{"r": 255, "g": 255, "b": 255, "w": 255}]}'
```
