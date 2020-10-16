
import { readUrl } from "../src/data/base/Image"

test.each([
  [ 
    "http://transformice.com/images/x_transformice/x_evt/x_evt_03/0or8meuj/map-mongolfiere.jpg", 
    "x_transformice/x_evt/x_evt_03/0or8meuj/map-mongolfiere.jpg",
    "https://data.atelier801.com/x_transformice/x_evt/x_evt_03/0or8meuj/map-mongolfiere.jpg"
  ],
  [ 
    "http://transformice.com/images/tfmadv/cuisto/ingredients/15.png", 
    "tfmadv/cuisto/ingredients/15.png",
    "https://data.atelier801.com/tfmadv/cuisto/ingredients/15.png"
  ],
  [ 
    "http://transformice.com/images/x_temps/x_p/bn985bjx.png", 
    "x_temps/x_p/bn985bjx.png",
    "https://data.atelier801.com/x_temps/x_p/bn985bjx.png"
  ],
  [ 
    "http://transformice.com/godspaw/img/bonus/b1.png", 
    "godspaw/img/bonus/b1.png",
    "https://data.atelier801.com/godspaw/img/bonus/b1.png"
  ],
  [ 
    "http://transformice.com/share/Carnaval/1024_768.jpg", 
    "../share/Carnaval/1024_768.jpg",
    "http://transformice.com/share/Carnaval/1024_768.jpg"
  ],
  [ 
    "http://images.atelier801.com/1738bc43766.png", 
    "1738bc43766.png",
    "http://images.atelier801.com/1738bc43766.png"
  ],
  
  [ 
    "x_transformice/x_evt/x_evt_03/0or8meuj/map-mongolfiere.jpg", 
    "x_transformice/x_evt/x_evt_03/0or8meuj/map-mongolfiere.jpg",
    "https://data.atelier801.com/x_transformice/x_evt/x_evt_03/0or8meuj/map-mongolfiere.jpg"
  ],
  [ 
    "data.atelier801.com/tfmadv/cuisto/ingredients/15.png", 
    "data.atelier801.com/tfmadv/cuisto/ingredients/15.png",
    "https://data.atelier801.com/data.atelier801.com/tfmadv/cuisto/ingredients/15.png"
  ],
  [ 
    "../images/x_temps/x_p/bn985bjx.png", 
    "x_temps/x_p/bn985bjx.png",
    "https://data.atelier801.com/x_temps/x_p/bn985bjx.png"
  ],
  [ 
    "https://data.atelier801.com/godspaw/img/bonus/b1.png", 
    "godspaw/img/bonus/b1.png",
    "https://data.atelier801.com/godspaw/img/bonus/b1.png"
  ],
  [ 
    "../share/Carnaval/1024_768.jpg", 
    "../share/Carnaval/1024_768.jpg",
    "http://transformice.com/share/Carnaval/1024_768.jpg"
  ],
  [ 
    "1738bc43766.png", 
    "1738bc43766.png",
    "https://images.atelier801.com/1738bc43766.png"
  ],
  
  [ 
    "http://example.com/image.png", 
    "http://example.com/image.png",
    "http://example.com/image.png"
  ],
])
("Image.readUrl(%s)", (str, expectedValue, expectedUrl) => {
  let imageUrl = readUrl(str)
  expect(imageUrl.value).toBe(expectedValue)
  expect(imageUrl.url).toBe(expectedUrl)
})


/**

http://transformice.com/images/x_transformice/x_evt/x_evt_03/0or8meuj/map-mongolfiere.jpg
http://transformice.com/images/tfmadv/cuisto/ingredients/15.png
http://transformice.com/images/x_temps/x_p/bn985bjx.png
http://transformice.com/images/drapeaux/16/IE.png
http://transformice.com/godspaw/img/bonus/b1.png
http://transformice.com/share/Carnaval/1024_768.jpg

https://data.atelier801.com/x_transformice/x_evt/x_evt_03/0or8meuj/map-mongolfiere.jpg
https://data.atelier801.com/tfmadv/cuisto/ingredients/15.png
https://data.atelier801.com/x_temps/x_p/bn985bjx.png
https://data.atelier801.com/drapeaux/16/IE.png
https://data.atelier801.com/godspaw/img/bonus/b1.png
https://data.atelier801.com/../share/Carnaval/1024_768.jpg


 */