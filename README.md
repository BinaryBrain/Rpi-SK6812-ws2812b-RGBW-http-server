# Rpi-SK6812-ws2812b-RGBW-http-server

This is an express server that exposes an API to drive SK6812/ws2812b RGBW LED strips on a Raspberry Pi

## Hardware Install

1. Plug the +5V and GND in an external power supply.

2. Plug the DATA and GND in your Raspberry Pi.

3. The default data pin is GPIO18 (which is #12 on the circuit board). You can change it in the `.env` file.

## Software Install

Just run the server with:

```sh
cp .env.dist .env # Copy and edit environment variables
npm install
sudo npm start
```

### Supported LED_TYPE

```js
// 4 color R, G, B and W ordering
"sk6812-rgbw"
"sk6812-rbgw"
"sk6812-grbw"
"sk6812-gbrw"
"sk6812-brgw"
"sk6812-bgrw"

// 3 color R, G and B ordering
"ws2811-rgb"
"ws2811-rbg"
"ws2811-grb"
"ws2811-gbr"
"ws2811-brg"
"ws2811-bgr"

// predefined fixed LED types
"ws2812"
"sk6812"
"sk6812w"
```

## API

### HTTP

Do an HTTP POST with this JSON body:

```json
{
    "colors": [
        { "r": 255, "g": 255, "b": 255, "w": 255 },
        { "r": 255, "g": 0, "b": 0, "w": 0 },
        { "r": 0, "g": 255, "b": 0 },
        { "r": 0, "g": 0, "b": 255 },
        { "r": 0, "g": 0, "b": 0, "w": 255 }
    ]
}
```

Or this JSON body (`WWRRGGBB` or `RRGGBB`):

```json
{
    "colors": [
        "FF995522",
        "FF9955",
        "FF995500",
    ]
}
```

_Note that the "white" value is optionnal. It will default to 0._
_With as many element in the array as your LED strip is. Usually 30, **60** or 120 LED/m._

### UDP

The UDP server runs on port `13334` by default.

First byte is header: 0x03 for RGB, 0x04 for RGBW. Rest is payload, each byte is a color value.

For instance:

```
Head R    G    B    R    G    B   
0x03 0xFF 0x99 0x55 0xFF 0x99 0x55
```

```
Head W    R    G    B    W    R    G    B   
0x04 0x22 0xFF 0x99 0x55 0x22 0xFF 0x99 0x55
```

You can also send a JSON on UDP.
If the first character is a curly bracket (`{`) it will behave like the HTTP API.

```json
{"colors": ["9955CC", "FF9955CC"]}
```

## curl Example

```sh
curl -X POST \
  http://<raspberry-ip-address>:13334 \
  -H 'Content-Type: application/json' \
  -d '{ "colors": [{"r": 255, "g": 255, "b": 255, "w": 255}]}'
```
