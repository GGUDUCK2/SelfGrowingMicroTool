import fs from 'fs';

let dictContent = fs.readFileSync('src/lib/dictionaries.ts', 'utf8');

dictContent = dictContent.replace(
    /layers: "Layers Count",\s*alpha: "Base Alpha",\s*distance: "Distance",\s*blurMultiplier: "Blur Multiplier",\s*easing: "Easing Curve"/,
    `layers: "Layers Count",
          alpha: "Base Alpha",
          distance: "Distance",
          blurMultiplier: "Blur Multiplier",
          easing: "Easing Curve",
          info: "Generate multiple physical layers automatically.",
          linear: "Linear",
          easeOut: "Ease Out (Recommended)",
          easeIn: "Ease In",
          easeInOut: "Ease In Out"`
);

dictContent = dictContent.replace(
    /distance: "Distance",\s*intensity: "Intensity",\s*blur: "Blur",\s*shape: "Shape",\s*shapes: \{\s*flat: "Flat",\s*concave: "Concave",\s*convex: "Convex",\s*pressed: "Pressed"\s*},\s*lightPosition: "Light Position"/,
    `distance: "Distance",
          intensity: "Intensity",
          blur: "Blur",
          shape: "Shape",
          shapes: {
            flat: "Flat",
            concave: "Concave",
            convex: "Convex",
            pressed: "Pressed"
          },
          lightPosition: "Light Position",
          info: "Ensure your box color matches the background color.",
          directions: {
            topLeft: "Top Left",
            topRight: "Top Right",
            bottomLeft: "Bottom Left",
            bottomRight: "Bottom Right"
          }`
);

dictContent = dictContent.replace(
    /remove: "Remove",\s*reverseOrder: "Reverse Order"/,
    `remove: "Remove",
          reverseOrder: "Reverse Order",
          layerPrefix: "Layer",
          alpha: "Alpha"`
);


dictContent = dictContent.replace(
    /layers: "레이어 개수",\s*alpha: "기본 투명도",\s*distance: "거리",\s*blurMultiplier: "흐림 배수",\s*easing: "곡선\(Easing\)"/,
    `layers: "레이어 개수",
          alpha: "기본 투명도",
          distance: "거리",
          blurMultiplier: "흐림 배수",
          easing: "곡선(Easing)",
          info: "물리적 특성을 가진 여러 레이어를 자동 생성합니다.",
          linear: "선형 (Linear)",
          easeOut: "이즈 아웃 (권장)",
          easeIn: "이즈 인",
          easeInOut: "이즈 인 아웃"`
);

dictContent = dictContent.replace(
    /distance: "거리",\s*intensity: "강도",\s*blur: "흐림",\s*shape: "모양",\s*shapes: \{\s*flat: "평면 \(Flat\)",\s*concave: "오목한 \(Concave\)",\s*convex: "볼록한 \(Convex\)",\s*pressed: "눌린 \(Pressed\)"\s*},\s*lightPosition: "빛의 위치"/,
    `distance: "거리",
          intensity: "강도",
          blur: "흐림",
          shape: "모양",
          shapes: {
            flat: "평면 (Flat)",
            concave: "오목한 (Concave)",
            convex: "볼록한 (Convex)",
            pressed: "눌린 (Pressed)"
          },
          lightPosition: "빛의 위치",
          info: "뉴모피즘의 경우 상자 색상이 배경색과 정확히 일치해야 합니다.",
          directions: {
            topLeft: "좌측 상단",
            topRight: "우측 상단",
            bottomLeft: "좌측 하단",
            bottomRight: "우측 하단"
          }`
);

dictContent = dictContent.replace(
    /remove: "제거",\s*reverseOrder: "순서 반전"/,
    `remove: "제거",
          reverseOrder: "순서 반전",
          layerPrefix: "레이어",
          alpha: "투명도"`
);

fs.writeFileSync('src/lib/dictionaries.ts', dictContent);
