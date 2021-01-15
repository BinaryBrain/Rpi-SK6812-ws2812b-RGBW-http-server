# Rpi-SK6812-ws2812b-RGBW-http-server

This is an express server that exposes an API to drive SK6812/ws2812b RGBW LED strips on a Raspberry Pi

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

Or this JSON body:

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

The UDP server runs on port `13335` by default.

First byte is header: 0x03 for RGB, 0x04 for RGBW. Rest is payload, each byte is a color value.

For instance:

```
Head R    G    B    R    G    B   
0x03 0xFF 0x99 0x55 0xFF 0x99 0x55
```

```
Head R    G    B    W    R    G    B    W   
0x04 0xFF 0x99 0x55 0x22 0xFF 0x99 0x55 0x22
```

You can also send a JSON on UDP.
If the first character is a curly bracket (`{`) it will behave like the HTTP API.

```json
{"colors": ["FF9955", "FF9955FF"]}
```

## curl Example

```sh
curl -X POST \
  http://<raspberry-ip-address>:13334 \
  -H 'Content-Type: application/json' \
  -d '{ "colors": [{"r": 255, "g": 255, "b": 255, "w": 255}]}'
```

## What we send to ws281x lib

Each line is an UInt32.

### RGBW

```
2^ | 3 2 1 0
i+ | - 0 1 2
---+--------
0  | - r g b
1  | - w r g
2  | - b w r
3  | - g b w
4  | - r g b
5  | - w r g
6  | - b w r
7  | - g b w
```

### GRBW

```
2^ | 3 2 1 0
i+ | - 0 1 2
---+--------
0  | - g r b
1  | - w g r
2  | - b w g
3  | - r b w
4  | - g r b
5  | - w g r
6  | - b w g
7  | - r b w
```
