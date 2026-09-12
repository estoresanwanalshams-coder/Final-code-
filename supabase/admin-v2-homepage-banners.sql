alter table public.site_settings
  add column if not exists banner_slides jsonb;

update public.site_settings
set banner_slides =
  case
    when banner_image_url is not null
      and btrim(banner_image_url) <> ''
      and banner_image_url not in (
        '/banners/banner-1.png',
        '/banners/banner-2.png',
        '/banners/banner-3.png'
      )
    then jsonb_build_array(
      jsonb_build_object(
        'id', 'legacy-custom-banner',
        'imageUrl', banner_image_url,
        'isActive', true,
        'displayOrder', 1
      ),
      jsonb_build_object(
        'id', 'banner-1',
        'imageUrl', '/banners/banner-1.png',
        'isActive', true,
        'displayOrder', 2
      ),
      jsonb_build_object(
        'id', 'banner-2',
        'imageUrl', '/banners/banner-2.png',
        'isActive', true,
        'displayOrder', 3
      ),
      jsonb_build_object(
        'id', 'banner-3',
        'imageUrl', '/banners/banner-3.png',
        'isActive', true,
        'displayOrder', 4
      )
    )
    else jsonb_build_array(
      jsonb_build_object(
        'id', 'banner-1',
        'imageUrl', '/banners/banner-1.png',
        'isActive', true,
        'displayOrder', 1
      ),
      jsonb_build_object(
        'id', 'banner-2',
        'imageUrl', '/banners/banner-2.png',
        'isActive', true,
        'displayOrder', 2
      ),
      jsonb_build_object(
        'id', 'banner-3',
        'imageUrl', '/banners/banner-3.png',
        'isActive', true,
        'displayOrder', 3
      )
    )
  end
where banner_slides is null;

alter table public.site_settings
  alter column banner_slides
  set default '[
    {
      "id": "banner-1",
      "imageUrl": "/banners/banner-1.png",
      "isActive": true,
      "displayOrder": 1
    },
    {
      "id": "banner-2",
      "imageUrl": "/banners/banner-2.png",
      "isActive": true,
      "displayOrder": 2
    },
    {
      "id": "banner-3",
      "imageUrl": "/banners/banner-3.png",
      "isActive": true,
      "displayOrder": 3
    }
  ]'::jsonb;

alter table public.site_settings
  alter column banner_slides set not null;