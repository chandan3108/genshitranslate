#!/usr/bin/env python3
import os
from PIL import Image

def generate_icons():
    src_path = 'public/icon-512.png'
    if not os.path.exists(src_path):
        raise FileNotFoundError(f"Source icon not found at {src_path}")

    src_img = Image.open(src_path).convert('RGBA')
    bg_color = (12, 15, 29, 255) # #0c0f1d

    print("Generating Android mipmap icons...")
    # 1. Android Legacy Launcher (Square & Round)
    legacy_sizes = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192,
    }

    for folder, size in legacy_sizes.items():
        dest_dir = os.path.join('android/app/src/main/res', folder)
        os.makedirs(dest_dir, exist_ok=True)
        
        # ic_launcher.png
        resized = src_img.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(os.path.join(dest_dir, 'ic_launcher.png'), 'PNG')
        resized.save(os.path.join(dest_dir, 'ic_launcher_round.png'), 'PNG')
        print(f"  {folder}: {size}x{size} saved")

    # 2. Android Adaptive Icon Foregrounds (ic_launcher_foreground.png)
    # The canvas is 108dp, inner safe zone is 72dp (~66.7%).
    # We fit the 512x512 logo into the central ~72% of the canvas with #0c0f1d background
    foreground_sizes = {
        'mipmap-mdpi': 108,
        'mipmap-hdpi': 162,
        'mipmap-xhdpi': 216,
        'mipmap-xxhdpi': 324,
        'mipmap-xxxhdpi': 432,
    }

    for folder, total_size in foreground_sizes.items():
        dest_dir = os.path.join('android/app/src/main/res', folder)
        os.makedirs(dest_dir, exist_ok=True)

        # Scale logo to ~72% of canvas size to sit perfectly in the safe zone
        logo_size = int(total_size * 0.76)
        logo_resized = src_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

        # Create canvas filled with #0c0f1d
        fg_canvas = Image.new('RGBA', (total_size, total_size), bg_color)
        offset = ((total_size - logo_size) // 2, (total_size - logo_size) // 2)
        fg_canvas.paste(logo_resized, offset, logo_resized)
        
        fg_path = os.path.join(dest_dir, 'ic_launcher_foreground.png')
        fg_canvas.save(fg_path, 'PNG')
        print(f"  {folder} foreground: {total_size}x{total_size} (logo: {logo_size}x{logo_size}) saved")

    # 3. Android Splash Screens
    splash_targets = {
        'drawable': (480, 320),
        'drawable-land-mdpi': (480, 320),
        'drawable-land-hdpi': (800, 480),
        'drawable-land-xhdpi': (1280, 720),
        'drawable-land-xxhdpi': (1600, 960),
        'drawable-land-xxxhdpi': (1920, 1280),
        'drawable-port-mdpi': (320, 480),
        'drawable-port-hdpi': (480, 800),
        'drawable-port-xhdpi': (720, 1280),
        'drawable-port-xxhdpi': (960, 1600),
        'drawable-port-xxxhdpi': (1280, 1920),
    }

    print("\nGenerating Android splash screens...")
    for folder, (w, h) in splash_targets.items():
        dest_dir = os.path.join('android/app/src/main/res', folder)
        os.makedirs(dest_dir, exist_ok=True)

        splash = Image.new('RGBA', (w, h), bg_color)
        # Emblem size: ~40% of the shorter dimension
        short_dim = min(w, h)
        logo_dim = max(96, int(short_dim * 0.42))
        logo_scaled = src_img.resize((logo_dim, logo_dim), Image.Resampling.LANCZOS)
        
        pos = ((w - logo_dim) // 2, (h - logo_dim) // 2)
        splash.paste(logo_scaled, pos, logo_scaled)
        splash.convert('RGB').save(os.path.join(dest_dir, 'splash.png'), 'PNG')
        print(f"  {folder}: {w}x{h} (logo: {logo_dim}x{logo_dim}) saved")

    # 4. iOS AppIcon
    print("\nGenerating iOS app icon...")
    ios_icon_dir = 'ios/App/App/Assets.xcassets/AppIcon.appiconset'
    if os.path.exists(ios_icon_dir):
        ios_icon = src_img.resize((1024, 1024), Image.Resampling.LANCZOS)
        ios_icon.convert('RGB').save(os.path.join(ios_icon_dir, 'AppIcon-512@2x.png'), 'PNG')
        print("  iOS 1024x1024 AppIcon-512@2x.png saved")

    # 5. iOS Splash
    ios_splash_dir = 'ios/App/App/Assets.xcassets/Splash.imageset'
    if os.path.exists(ios_splash_dir):
        w, h = 2732, 2732
        ios_splash = Image.new('RGBA', (w, h), bg_color)
        logo_dim = int(min(w, h) * 0.28) # ~765px centered
        logo_scaled = src_img.resize((logo_dim, logo_dim), Image.Resampling.LANCZOS)
        pos = ((w - logo_dim) // 2, (h - logo_dim) // 2)
        ios_splash.paste(logo_scaled, pos, logo_scaled)
        rgb_splash = ios_splash.convert('RGB')
        for name in ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']:
            rgb_splash.save(os.path.join(ios_splash_dir, name), 'PNG')
            print(f"  iOS {name} saved")

    print("\nAll native app icons and splash assets successfully generated!")

if __name__ == '__main__':
    generate_icons()
