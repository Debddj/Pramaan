from typing import List, Optional
from app.schemas.surveillance import ListingItem

PRE_CRAWLED_DATASET: List[ListingItem] = [
    ListingItem(
        listing_id="AMZ-001",
        title="Britannia Good Day Butter Cookies, 100g Pouch",
        marketplace="amazon",
        listing_url="https://www.amazon.in/dp/B00T78N8A4",
        seller="Cloudtail Retail India Pvt Ltd",
        price=30.0,
        category="biscuits",
        sample_ocr_text="""
        BRITANNIA GOOD DAY Butter Cookies
        Net Qty: 100 g
        MRP Rs. 30.00 (Incl. of all taxes)
        Mfg Date: 08/2026
        Mfd By: Britannia Industries Ltd, 5/1A Hungerford Street, Kolkata - 700017
        Consumer Care: feedback@britindia.com / 1800-425-4449
        Country of Origin: India
        """,
    ),
    ListingItem(
        listing_id="AMZ-002",
        title="Fortune Sunlite Refined Sunflower Oil, 900ml Pouch",
        marketplace="amazon",
        listing_url="https://www.amazon.in/dp/B010GGD14M",
        seller="SuperComNet",
        price=145.0,
        category="edible_oil",
        sample_ocr_text="""
        FORTUNE SUNLITE Refined Sunflower Oil
        Net Qty: 900 ml
        MRP Rs. 145.00 (Incl. of all taxes)
        Mfg Date: 07/2026
        Mfd By: Adani Wilmar Limited, Fortune House, Ahmedabad - 380009
        Consumer Care: care@adaniwilmar.in
        Country of Origin: India
        """,
    ),
    ListingItem(
        listing_id="FK-001",
        title="GlowUltra Advanced Brightening Cream 50ml",
        marketplace="flipkart",
        listing_url="https://www.flipkart.com/glowultra-cream/p/itm12345678",
        seller="GlobalImports Retail",
        price=899.0,
        category="general",
        sample_ocr_text="""
        GLOW ULTRA Advanced Brightening Cream
        Net Qty: 50 ml
        MRP Rs. 899.00
        Imported and Marketed by: XYZ Wellness Ltd
        """,
    ),
    ListingItem(
        listing_id="FK-002",
        title="Tata Sampann Unpolished Toor Dal 1kg",
        marketplace="flipkart",
        listing_url="https://www.flipkart.com/tata-sampann-toor-dal/p/itm87654321",
        seller="RetailNet",
        price=185.0,
        category="pulses",
        sample_ocr_text="""
        TATA SAMPANN Unpolished Toor Dal
        Net Qty: 1 kg
        MRP Rs. 185.00 (Incl. of all taxes)
        Mfg Date: 08/2026
        Mfd By: Tata Consumer Products Ltd, 1 Bishop Lefroy Road, Kolkata
        Consumer Care: customercare@tataconsumer.com / 1800-108-4488
        Country of Origin: India
        """,
    ),
    ListingItem(
        listing_id="AMZ-003",
        title="Everest Shahi Garam Masala 100g Pack",
        marketplace="amazon",
        listing_url="https://www.amazon.in/dp/B00LZZ8910",
        seller="Everest Spices Direct",
        price=92.0,
        category="spices",
        sample_ocr_text="""
        EVEREST Shahi Garam Masala
        Net Qty: 100 g
        MRP Rs. 92.00
        Mfg Date: 06/2026
        Mfd By: S. Narendrakumar & Co., D.N. Road, Mumbai - 400001
        Country of Origin: India
        """,
    ),
]


def get_pre_crawled_listings() -> List[ListingItem]:
    return PRE_CRAWLED_DATASET


def find_listing(listing_id: Optional[str] = None, url: Optional[str] = None) -> Optional[ListingItem]:
    for item in PRE_CRAWLED_DATASET:
        if listing_id and item.listing_id == listing_id:
            return item
        if url and item.listing_url == url:
            return item
    return None
