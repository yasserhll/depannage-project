import L from 'leaflet';

function svgIcon(svg: string, size: [number, number] = [40, 40]): L.DivIcon {
  return L.divIcon({
    html:        svg,
    iconSize:    size,
    iconAnchor:  [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
    className:   '',
  });
}

export const clientIcon = svgIcon(`
  <div style="
    width:40px;height:40px;
    background:#f97316;border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 4px 14px rgba(249,115,22,0.6);
    display:flex;align-items:center;justify-content:center;
  ">
    <svg style="transform:rotate(45deg)" width="20" height="20" fill="white" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>
`);

export const depanneurIcon = svgIcon(`
  <div style="
    width:44px;height:44px;
    background:#3b82f6;border-radius:12px;
    box-shadow:0 4px 14px rgba(59,130,246,0.6);
    display:flex;align-items:center;justify-content:center;
    animation:truckMove 1.5s ease-in-out infinite;
  ">
    <svg width="26" height="26" fill="white" viewBox="0 0 24 24">
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  </div>
`, [44, 44]);

export const clientMissionIcon = svgIcon(`
  <div style="
    width:46px;height:46px;
    background:#f97316;border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 0 0 0 rgba(249,115,22,0.7);
    animation:ripple 1.4s ease-in-out infinite;
    display:flex;align-items:center;justify-content:center;
  ">
    <svg style="transform:rotate(45deg)" width="22" height="22" fill="white" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>
<style>
@keyframes ripple{0%{box-shadow:0 0 0 0 rgba(249,115,22,.7)}70%{box-shadow:0 0 0 12px rgba(249,115,22,0)}100%{box-shadow:0 0 0 0 rgba(249,115,22,0)}}
</style>
`, [46, 46]);

export const pulseIcon = svgIcon(`
  <div style="position:relative;width:20px;height:20px">
    <div style="
      position:absolute;inset:0;
      background:#f97316;border-radius:50%;
      animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
      opacity:0.4;
    "></div>
    <div style="
      position:relative;width:20px;height:20px;
      background:#f97316;border-radius:50%;
      border:3px solid white;
    "></div>
  </div>
`, [20, 20]);
