// Menus pulled from YANA's digital menu on 2026-09-25:
// FOOD MENU (62881) plus the drink menus 56458, 56498, 56499, 56500, 56501, 54262, 61623, 61626.
// Regenerate rather than hand-edit when the kitchen changes prices there.
export interface MenuItem {
  name: string
  desc: string
  price: string
  image: string
}

export interface MenuSection {
  id: string
  label: string
  items: MenuItem[]
}

export interface MenuGroup {
  id: string
  label: string
  sections: MenuSection[]
}

export const menuGroups: MenuGroup[] = [
  {
    "id": "food",
    "label": "Food",
    "sections": [
      {
        "id": "to-begin",
        "label": "To Begin",
        "items": [
          {
            "name": "Edamame Kombu",
            "desc": "Soybeans, sesame oil, shio kumbu, citrus zest",
            "price": "38",
            "image": "/images/menu/edamame-kombu.webp"
          },
          {
            "name": "Sauteed Edamame",
            "desc": "Soybeans, sea salt, citrus, oyster glaze",
            "price": "38",
            "image": "/images/menu/sauteed-edamame.webp"
          },
          {
            "name": "Miso Soup",
            "desc": "Dashi broth, miso, tofu, wakame, spring onion",
            "price": "28",
            "image": "/images/menu/miso-soup.webp"
          },
          {
            "name": "Peruvian Gyoza",
            "desc": "Seasoned meat dumplings, Soy-citrus dressing",
            "price": "58",
            "image": "/images/menu/peruvian-gyoza.webp"
          },
          {
            "name": "YANA Tom Yum",
            "desc": "Fragrant lemongrass and chili broth, shrimp, octopus, brown mushrooms, enoki mushrooms, cherry tomatoes",
            "price": "75",
            "image": "/images/menu/yana-tom-yum.webp"
          }
        ]
      },
      {
        "id": "raw-and-cold",
        "label": "Raw & Cold",
        "items": [
          {
            "name": "Hotate Tiradito",
            "desc": "Scallops, buttermilk leche de tigre, mentaiko, wasabi pico de gallo",
            "price": "59",
            "image": "/images/menu/hotate-tiradito.webp"
          },
          {
            "name": "Passion-Kissed Tuna Tataki",
            "desc": "Lightly seared akami tuna, passion fruit leche de tigre",
            "price": "65",
            "image": "/images/menu/passion-kissed-tuna-tataki.webp"
          },
          {
            "name": "Ume Tomato Mosaic",
            "desc": "Pickled and fresh tomato, umeboshi dressing, bubu arare, cress",
            "price": "55",
            "image": "/images/menu/ume-tomato-mosaic.webp"
          },
          {
            "name": "Crimson Beet Harmony",
            "desc": "Roasted beetroot, creamy accents, fresh herbs",
            "price": "59",
            "image": "/images/menu/crimson-beet-harmony.webp"
          },
          {
            "name": "YANA Garden Salad",
            "desc": "Seasonal greens, avocado, asparagus, cherry tomatoes and baby radish in rosemary honey vinaigrette with white sesame",
            "price": "49",
            "image": "/images/menu/yana-garden-salad.webp"
          },
          {
            "name": "Chicken Causa",
            "desc": "Yellow potato puree, aji amarillo chicken, fried leek, sakura mix",
            "price": "58",
            "image": "/images/menu/chicken-causa.webp"
          }
        ]
      },
      {
        "id": "signature-rolls",
        "label": "Signature Rolls",
        "items": [
          {
            "name": "Oro del Mar",
            "desc": "Salmon, crab, tobiko, sesame, teriyaki",
            "price": "90",
            "image": "/images/menu/oro-del-mar.webp"
          },
          {
            "name": "Prawn Tempura Roll",
            "desc": "Prawn tempura, sushi rice, crispy shrimp",
            "price": "74",
            "image": "/images/menu/prawn-tempura-roll.webp"
          },
          {
            "name": "Spicy Crab Roll",
            "desc": "Crab, prawn tempura, creamy spice",
            "price": "74",
            "image": "/images/menu/spicy-crab-roll.webp"
          }
        ]
      },
      {
        "id": "crispy-and-comfort",
        "label": "Crispy & Comfort",
        "items": [
          {
            "name": "Crispy Squid",
            "desc": "Fried squid, mango pico de gallo, yuzu kosho aioli",
            "price": "68",
            "image": "/images/menu/crispy-squid.webp"
          },
          {
            "name": "Shrimp Dynamite",
            "desc": "Tempura shrimp, dynamite sauce",
            "price": "79",
            "image": "/images/menu/shrimp-dynamite.webp"
          },
          {
            "name": "Chicken Karaage",
            "desc": "Japanese fried chicken, garlic emulsion, lemon",
            "price": "72",
            "image": "/images/menu/chicken-karaage.webp"
          },
          {
            "name": "Shrimp Croquettes",
            "desc": "Crisp shrimp croquettes, garlic mayo, chives, chilli",
            "price": "62",
            "image": "/images/menu/shrimp-croquettes.webp"
          },
          {
            "name": "Black Cod Croquettes",
            "desc": "Black cod, anchovy-huacatay aioli, bonito",
            "price": "65",
            "image": "/images/menu/black-cod-croquettes.webp"
          },
          {
            "name": "Beef Empanadas",
            "desc": "Aji panca-braised beef, golden pastry",
            "price": "69",
            "image": "/images/menu/beef-empanadas.webp"
          },
          {
            "name": "Tempura Mushrooms",
            "desc": "Enoki, portobello, eryngii, mushroom glaze, nori",
            "price": "72",
            "image": "/images/menu/tempura-mushrooms.webp"
          },
          {
            "name": "Aji De Gallina Empanadas",
            "desc": "Creamy chicken, aji amarillo, golden pastry",
            "price": "62",
            "image": ""
          }
        ]
      },
      {
        "id": "from-the-grill",
        "label": "From the Grill",
        "items": [
          {
            "name": "Yakitori",
            "desc": "Grilled chicken, tare glaze, spring onion, lime",
            "price": "68",
            "image": "/images/menu/yakitori.webp"
          },
          {
            "name": "Beef Skewer",
            "desc": "Tenderloin, saltado glaze",
            "price": "95",
            "image": "/images/menu/beef-skewer.webp"
          },
          {
            "name": "Octopus Skewer",
            "desc": "Charcoal-grilled octopus with peruvian marination",
            "price": "79",
            "image": "/images/menu/octopus-skewer.webp"
          },
          {
            "name": "Parrilla Slider",
            "desc": "Grilled beef, parrilla glaze, brioche",
            "price": "79",
            "image": "/images/menu/parrilla-slider.webp"
          },
          {
            "name": "Wild Mint Lamb Chop",
            "desc": "Aji panca and wild mint marinated lamb chop, herb-panko crust",
            "price": "85",
            "image": "/images/menu/wild-mint-lamb-chop.webp"
          },
          {
            "name": "Grilled Tenderloin",
            "desc": "Perfectly grilled beef tenderloin, served with a bright herb chimichurri",
            "price": "190",
            "image": "/images/menu/grilled-tenderloin.webp"
          },
          {
            "name": "YANA Parrilla T-Bone",
            "desc": "Grilled Angus T-Bone, rested and carved, served with fresh wasabi, vibrant chimichurri and sea salt",
            "price": "480",
            "image": "/images/menu/yana-parrilla-t-bone.webp"
          },
          {
            "name": "Japanese Wagyu Striploin (100g)",
            "desc": "A3 Japanese Wagyu Striploin, delicately grilled to preserve it's exquisite marbling and melt-in-the-mouth texture",
            "price": "140",
            "image": "/images/menu/japanese-wagyu-striploin-100g.webp"
          },
          {
            "name": "YANA Gold Sando",
            "desc": "Premium Tenderloin sandwich with tomato miso sauce, gold leaf, sakura mix",
            "price": "290",
            "image": "/images/menu/yana-gold-sando.webp"
          }
        ]
      },
      {
        "id": "mains",
        "label": "Mains",
        "items": [
          {
            "name": "Salmon Teriyaki",
            "desc": "Marinated salmon glazed with teriyaki, sweet potato mash, beetroot emulsion, mint oil",
            "price": "140",
            "image": "/images/menu/salmon-teriyaki.webp"
          },
          {
            "name": "Miso Black Cod",
            "desc": "Miso-marinated black cod with quinoa-pea salad, orange miso cream",
            "price": "159",
            "image": "/images/menu/miso-black-cod.webp"
          },
          {
            "name": "Lobster Quinotto",
            "desc": "Creamy quinoa risotto-style, finished with butter-poached lobster, ikura, tobiko and a delicate parmesan crisp, balanced with a touch of citrus",
            "price": "155",
            "image": "/images/menu/lobster-quinotto.webp"
          },
          {
            "name": "Pollo a la Brasa",
            "desc": "Marinated chicken with potato mash, onion pearl confit, baby carrots, coriander sauce",
            "price": "120",
            "image": "/images/menu/pollo-a-la-brasa.webp"
          },
          {
            "name": "Andean Striploin",
            "desc": "Angus striploin with potato fondant, crispy onion, shichimi",
            "price": "155",
            "image": "/images/menu/andean-striploin.webp"
          },
          {
            "name": "Short Rib",
            "desc": "Slow-cooked short rib glazed in it's reduction, served with mashed potato and chives",
            "price": "139",
            "image": "/images/menu/short-rib.webp"
          }
        ]
      },
      {
        "id": "sides",
        "label": "Sides",
        "items": [
          {
            "name": "Creamy Nikkei Rice",
            "desc": "Creamy Peruvian-inspired seafood rice, slow-cooked in prawn dashi with prawns, green peas, red capsicum and parmesan",
            "price": "45",
            "image": "/images/menu/creamy-nikkei-rice.webp"
          },
          {
            "name": "Fettuccini Huancaina",
            "desc": "Fettuccini in aji amarillo sauce, finished with parmesan, chives and shichimi",
            "price": "38",
            "image": "/images/menu/fettuccini-huancaina.webp"
          },
          {
            "name": "Coriander Pesto Fettuccini",
            "desc": "Fettuccini with coriander pesto, parmesan, dried cherry tomato",
            "price": "38",
            "image": "/images/menu/coriander-pesto-fettuccini.webp"
          },
          {
            "name": "Mashed Potato",
            "desc": "Creamy mashed potato finished with chives and shichimi",
            "price": "29",
            "image": "/images/menu/mashed-potato.webp"
          },
          {
            "name": "Andean Potato Mix",
            "desc": "Roasted white, purple and sweet potatoes with herbs, Maldon salt, crispy quinoa and sakura mix",
            "price": "35",
            "image": "/images/menu/andean-potato-mix.webp"
          }
        ]
      },
      {
        "id": "desserts",
        "label": "Desserts",
        "items": [
          {
            "name": "Churros",
            "desc": "Crisp matcha churros with dulce de leche and pistachio dust",
            "price": "65",
            "image": "/images/menu/churros.webp"
          },
          {
            "name": "Chocolate & Lucuma Mochi",
            "desc": "Chocolate and lucuma mochi with hazelnut praline and vanilla ice cream",
            "price": "88",
            "image": "/images/menu/chocolate-and-lucuma-mochi.webp"
          },
          {
            "name": "Matcha Cheesecake",
            "desc": "Burnt matcha cheesecake with vanilla ice cream and pistachio crumble",
            "price": "75",
            "image": "/images/menu/matcha-cheesecake.webp"
          },
          {
            "name": "Quinoa Textures",
            "desc": "Quinoa brownie, crispy quinoa and quinoa glass with vanilla ice cream and strawberry coulis",
            "price": "70",
            "image": "/images/menu/quinoa-textures.webp"
          }
        ]
      }
    ]
  },
  {
    "id": "drinks",
    "label": "Drinks",
    "sections": [
      {
        "id": "mocktails",
        "label": "Mocktails",
        "items": [
          {
            "name": "Tropical Sunrise",
            "desc": "",
            "price": "45",
            "image": "/images/menu/tropical-sunrise.webp"
          },
          {
            "name": "Berry Passion",
            "desc": "",
            "price": "45",
            "image": "/images/menu/berry-passion.webp"
          },
          {
            "name": "Yuzu Chee",
            "desc": "A delicate fusion of yuzu citrus and lychee, balanced with floral undertones and a soft sparkle — light, fragrant, and elegantly exotic.",
            "price": "45",
            "image": "/images/menu/yuzu-chee.webp"
          },
          {
            "name": "Melon Petals",
            "desc": "",
            "price": "45",
            "image": "/images/menu/melon-petals.webp"
          },
          {
            "name": "Casa Morada",
            "desc": "A bold twist on tradition — layered with purple corn, green apple, and warm cinnamon, garnished with pineapple leaves.",
            "price": "50",
            "image": "/images/menu/casa-morada.webp"
          }
        ]
      },
      {
        "id": "matchas",
        "label": "Matchas",
        "items": [
          {
            "name": "FRESA VERDE",
            "desc": "Fresh strawberries, strawberry fruit base, coconut milk, ceremonial matcha",
            "price": "40",
            "image": "/images/menu/fresa-verde.webp"
          },
          {
            "name": "Durado Matcha",
            "desc": "Mango Puree, Milk, Matcha",
            "price": "40",
            "image": "/images/menu/durado-matcha.webp"
          },
          {
            "name": "COCO CLOUD",
            "desc": "Ceremonial Matcha, Coconut water",
            "price": "40",
            "image": "/images/menu/coco-cloud.webp"
          },
          {
            "name": "ICED MATCHA",
            "desc": "Matcha powder, Oat milk",
            "price": "35",
            "image": "/images/menu/iced-matcha.webp"
          }
        ]
      },
      {
        "id": "mojitos",
        "label": "Mojitos",
        "items": [
          {
            "name": "Classic Mojito",
            "desc": "A sparkling blend of lime, mint, and syrup — crisp, cool, and made to refresh.",
            "price": "38",
            "image": "/images/menu/classic-mojito.webp"
          },
          {
            "name": "Strawberry Mojito",
            "desc": "Fresh strawberries meet lime and mint in this fizzy twist on the classic — fruity, cool, and irresistibly refreshing",
            "price": "40",
            "image": "/images/menu/strawberry-mojito.webp"
          },
          {
            "name": "Berries Mojito",
            "desc": "A vibrant medley of mixed berries, lime, and mint with a fizzy splash — bold, refreshing, and full of flavor.",
            "price": "40",
            "image": "/images/menu/berries-mojito.webp"
          },
          {
            "name": "Passion Fruit Mojito",
            "desc": "Tangy passion fruit blended with lime, mint, and soda — a tropical twist on the classic mojito",
            "price": "40",
            "image": "/images/menu/passion-fruit-mojito.webp"
          }
        ]
      },
      {
        "id": "juices",
        "label": "Juices",
        "items": [
          {
            "name": "Pomegranate Juice",
            "desc": "",
            "price": "40",
            "image": "/images/menu/pomegranate-juice.webp"
          },
          {
            "name": "ORANGE JUICE",
            "desc": "Pure, sun-ripened oranges squeezed to perfection — vibrant, sweet, and naturally refreshing.",
            "price": "35",
            "image": "/images/menu/orange-juice.webp"
          },
          {
            "name": "Chia Cucumber Juice",
            "desc": "",
            "price": "35",
            "image": "/images/menu/chia-cucumber-juice.webp"
          },
          {
            "name": "Minty Lemonade",
            "desc": "Zesty lemon and cool mint blended into an icy refreshment — crisp, citrusy, and energizing",
            "price": "35",
            "image": "/images/menu/minty-lemonade.webp"
          }
        ]
      },
      {
        "id": "coffees",
        "label": "Coffees",
        "items": [
          {
            "name": "ESPRESSO",
            "desc": "A rich and intense shot of coffee.",
            "price": "16",
            "image": "/images/menu/espresso.webp"
          },
          {
            "name": "Piccolo",
            "desc": "A small latte with a rich espresso flavor.",
            "price": "20",
            "image": "/images/menu/piccolo.webp"
          },
          {
            "name": "Americano",
            "desc": "Espresso poured over hot water.",
            "price": "18",
            "image": "/images/menu/americano.webp"
          },
          {
            "name": "Latte",
            "desc": "Espresso with steamed milk and light foam.",
            "price": "30",
            "image": "/images/menu/latte.webp"
          },
          {
            "name": "Flatwhite",
            "desc": "Espresso with velvety steamed milk.",
            "price": "25",
            "image": "/images/menu/flatwhite.webp"
          },
          {
            "name": "Cappucino",
            "desc": "Espresso with equal parts milk and foam.",
            "price": "25",
            "image": "/images/menu/cappucino.webp"
          },
          {
            "name": "Peruvian Latte",
            "desc": "Espresso with sweetened condensed milk and steamed milk.",
            "price": "38",
            "image": "/images/menu/peruvian-latte.webp"
          },
          {
            "name": "Cortado",
            "desc": "Equal parts espresso and warm milk.",
            "price": "25",
            "image": "/images/menu/cortado.webp"
          },
          {
            "name": "Macchiato",
            "desc": "Espresso with a touch of milk foam.",
            "price": "20",
            "image": "/images/menu/macchiato.webp"
          },
          {
            "name": "Hot Matcha",
            "desc": "Smooth Japanese green tea blended with steamed milk for a warm, earthy treat.",
            "price": "30",
            "image": "/images/menu/hot-matcha.webp"
          }
        ]
      },
      {
        "id": "soft-drinks-and-water",
        "label": "Soft Drinks & Water",
        "items": [
          {
            "name": "Sparkling Water 330ml",
            "desc": "",
            "price": "26",
            "image": "/images/menu/sparkling-water-330ml.webp"
          },
          {
            "name": "Sparkling Water 750ml",
            "desc": "",
            "price": "40",
            "image": "/images/menu/sparkling-water-750ml.webp"
          },
          {
            "name": "Still Water 330ml",
            "desc": "",
            "price": "24",
            "image": "/images/menu/still-water-330ml.webp"
          },
          {
            "name": "Still Water 750ml",
            "desc": "",
            "price": "38",
            "image": "/images/menu/still-water-750ml.webp"
          },
          {
            "name": "Light Cola",
            "desc": "",
            "price": "18",
            "image": "/images/menu/light-cola.webp"
          },
          {
            "name": "Sprite",
            "desc": "",
            "price": "18",
            "image": "/images/menu/sprite.webp"
          },
          {
            "name": "Coca Cola",
            "desc": "",
            "price": "18",
            "image": "/images/menu/coca-cola.webp"
          },
          {
            "name": "Tonic Water",
            "desc": "",
            "price": "20",
            "image": "/images/menu/tonic-water.webp"
          },
          {
            "name": "Red Bull",
            "desc": "",
            "price": "40",
            "image": "/images/menu/red-bull.webp"
          },
          {
            "name": "Ginger Ale",
            "desc": "",
            "price": "20",
            "image": "/images/menu/ginger-ale.webp"
          }
        ]
      },
      {
        "id": "teas",
        "label": "Teas",
        "items": [
          {
            "name": "Chamomile Blossom",
            "desc": "A soothing herbal infusion of premium organic chamomile blossoms, with bright floral notes, a hint of hay, and a naturally sweet, lingering finish.",
            "price": "40",
            "image": "/images/menu/chamomile-blossom.webp"
          },
          {
            "name": "Oriental Moments",
            "desc": "A rich blend of pu-erh and black tea with hints of cinnamon, sandalwood, and vanilla, accented by cardamom and floral petals — a fragrant taste of the Orient.",
            "price": "40",
            "image": "/images/menu/oriental-moments.webp"
          },
          {
            "name": "Apple Elderflower Tea",
            "desc": "A refreshing blend of elderflower and fruity apple, complemented by hibiscus, rosehip, peppermint, and blackberry leaves for a harmonious, invigorating infusion.",
            "price": "40",
            "image": "/images/menu/apple-elderflower-tea.webp"
          },
          {
            "name": "Organic Japanese Sencha",
            "desc": "A full-bodied, aromatic green tea from Kagoshima, blending Yutakamidori, Asatsuyu, and Saemidori leaves. Mild and sweet on the first sip, evolving into richer flavors with each infusion.",
            "price": "40",
            "image": "/images/menu/organic-japanese-sencha.webp"
          },
          {
            "name": "Jasmine Needle Tea",
            "desc": "Also known as Blue or Butterfly Pea Tea, this naturally sweet, floral tea transforms from deep blue to vibrant violet with a splash of lemon.",
            "price": "40",
            "image": "/images/menu/jasmine-needle-tea.webp"
          }
        ]
      },
      {
        "id": "coolers",
        "label": "Coolers",
        "items": [
          {
            "name": "Oriental Coolers",
            "desc": "A refreshing blend of bold black tea infused with zesty lemon juice and a touch of simple syrup. Perfectly balanced between citrus brightness and smooth tea richness — a timeless classic with an oriental twist",
            "price": "38",
            "image": "/images/menu/oriental-coolers.webp"
          },
          {
            "name": "Sapphire Cooler",
            "desc": "A captivating blend of fragrant jasmine white tea, fresh lemon juice, and a touch of simple syrup. Watch the magic unfold as its natural blue hue transforms into a vibrant purple — a refreshing, aromatic, and visually stunning drink experience.",
            "price": "38",
            "image": "/images/menu/sapphire-cooler.webp"
          },
          {
            "name": "Blossom Cooler",
            "desc": "A soothing chamomile herbal infusion elevated with tropical passion fruit and a splash of lemon juice. Smooth, vibrant, and naturally refreshing — where floral calm meets exotic fruit brightness.",
            "price": "38",
            "image": "/images/menu/blossom-cooler.webp"
          },
          {
            "name": "Elder Cooler",
            "desc": "Crisp apple notes and delicate elderflower aromas come together for a smooth, balanced, and uplifting drink.",
            "price": "38",
            "image": "/images/menu/elder-cooler.webp"
          }
        ]
      }
    ]
  }
]
