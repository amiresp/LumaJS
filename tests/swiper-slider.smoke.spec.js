import {test,expect} from "@playwright/test";

test("local Swiper Element hydrates slides fetched by GlobalCaller",async({page})=>{
  const bad=[];
  page.on("pageerror",error=>bad.push(error.message));
  await page.goto("/examples/basic/");
  const host=page.locator('[data-luma="SwiperSlider"]');
  await expect(host).toHaveAttribute("data-load-state","ready");
  const swiper=host.locator('[data-id="swiper"]');
  await expect(swiper.locator('[data-id="slide"]')).toHaveCount(3);
  await expect(swiper.locator('[data-id="title"]').first()).toHaveText("Local Swiper Element");
  await expect(swiper).toHaveJSProperty("initialized",true);
  expect(bad).toEqual([]);
});
test("SwiperSlider rejects unsafe URLs and escapes textual slide content",async({page})=>{
  await page.goto("/examples/basic/");
  await expect(page.locator('[data-luma="SwiperSlider"]')).toHaveAttribute("data-load-state","ready");
  const details=await page.evaluate(async()=>{
    const host=document.querySelector('[data-luma="SwiperSlider"]');
    const slider=(await import("/js/dependency/global/GlobalComponents/SwiperSlider/SwiperSlider.js")).create(host.querySelector('[data-id="root"]'));
    slider.setItems([{title:"<script>bad</script>",src:"javascript:alert(1)",link:"javascript:alert(2)"}]);
    const root=host.querySelector('[data-id="root"]');
    const result={title:root.querySelector('[data-id="title"]').textContent,scriptCount:root.querySelectorAll("script").length,src:root.querySelector('[data-id="standalone-image"]').getAttribute("src"),href:root.querySelector('[data-id="link"]').getAttribute("href")};
    slider.destroy();
    return result;
  });
  expect(details).toEqual({title:"<script>bad</script>",scriptCount:0,src:null,href:null});
});
