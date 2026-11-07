const $ = id => document.getElementById(id);

let ideas = JSON.parse(localStorage.getItem("asharIdeas") || "[]");
let posts = JSON.parse(localStorage.getItem("asharPosts") || "[]");
let campaigns = JSON.parse(localStorage.getItem("asharCampaigns") || "[]");

function saveData(){
  localStorage.setItem("asharIdeas",JSON.stringify(ideas));
  localStorage.setItem("asharPosts",JSON.stringify(posts));
  localStorage.setItem("asharCampaigns",JSON.stringify(campaigns));
  updateDashboard();
}

function updateDashboard(){
  $("ideaCount").textContent=ideas.length;
  $("postCount").textContent=posts.length;
  $("campaignCount").textContent=campaigns.length;
}

function showPage(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.querySelectorAll(".nav").forEach(b=>b.classList.remove("active"));
  $(page).classList.add("active");
  const nav=document.querySelector(`.nav[data-page="${page}"]`);
  if(nav)nav.classList.add("active");
  const titles={
    dashboard:"Dashboard",social:"Social Media",
    captions:"AI Caption Studio",seo:"SEO Analyzer",
    planner:"Content Planner",campaigns:"Campaign Manager"
  };
  $("pageTitle").textContent=titles[page];
}

document.querySelectorAll(".nav").forEach(btn=>{
  btn.addEventListener("click",()=>showPage(btn.dataset.page));
});

document.querySelectorAll("[data-go]").forEach(btn=>{
  btn.addEventListener("click",()=>showPage(btn.dataset.go));
});

// Caption generator
$("generateCaption").addEventListener("click",()=>{
  const topic=$("captionTopic").value.trim();
  const platform=$("captionPlatform").value;
  const tone=$("captionTone").value;

  if(!topic){
    alert("Please enter your post topic first.");
    return;
  }

  const openers={
    Professional:"Make your next move count.",
    Creative:"Something exciting is happening!",
    Funny:"Stop scrolling! This one's for you.",
    Friendly:"Hey everyone! We have something special.",
    Luxury:"Experience quality beyond expectations."
  };

  const hashtags=topic.toLowerCase()
    .replace(/[^a-z0-9 ]/g,"")
    .split(/\s+/)
    .filter(w=>w.length>2)
    .slice(0,4)
    .map(w=>"#"+w)
    .join(" ");

  const caption=
`${openers[tone]}

${topic}

Discover more and stay connected with us!

${hashtags} #${platform.replace(/\s/g,"")} #Marketing`;

  $("captionOutput").textContent=caption;
  $("captionResult").style.display="block";
});

$("copyCaption").addEventListener("click",async()=>{
  try{
    await navigator.clipboard.writeText($("captionOutput").textContent);
    $("copyCaption").textContent="Copied!";
  }catch(e){
    alert("Please select and copy the caption manually.");
  }
});

$("saveCaption").addEventListener("click",()=>{
  const caption=$("captionOutput").textContent;
  if(!caption || caption==="Your generated caption will appear here.")return;
  ideas.unshift(caption);
  saveData();
  alert("Caption idea saved!");
});

// SEO analyzer
$("analyzeSeo").addEventListener("click",()=>{
  const content=$("seoContent").value.trim();
  const keyword=$("seoKeyword").value.trim().toLowerCase();

  if(!content || !keyword){
    alert("Enter your content and target keyword.");
    return;
  }

  const words=content.split(/\s+/).filter(Boolean).length;
  const matches=(content.toLowerCase().match(
    new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g")
  )||[]).length;
  const density=((matches/Math.max(words,1))*100).toFixed(2);

  let score=0;
  if(words>=100)score+=30;
  if(matches>0)score+=25;
  if(matches>=2)score+=15;
  if(content.length>=500)score+=15;
  if(content.includes("?")||content.includes("!"))score+=5;
  if(words>=300)score+=10;

  $("seoOutput").textContent=
`SEO CONTENT REPORT

Estimated score: ${score}/100
Word count: ${words}
Keyword: ${keyword}
Keyword appearances: ${matches}
Keyword density: ${density}%

RECOMMENDATIONS
${words<100?"• Add more useful content.\n":""}
${matches===0?"• Include your target keyword naturally.\n":""}
${matches===1?"• Consider using the keyword naturally in another relevant section.\n":""}
${words<300?"• Expand your content with useful details and answers.\n":""}
• Add a clear page title and meta description.
• Use headings to organize your content.
• Make sure your page is useful and easy to read.

This is a basic content check, not a Google ranking prediction.`;

  $("seoResult").style.display="block";
});

// Content planner
function renderPosts(){
  $("postList").innerHTML="";
  if(!posts.length){
    $("postList").textContent="No posts added yet.";
    return;
  }

  posts.forEach((post,index)=>{
    const item=document.createElement("div");
    item.className="saved-item";
    const info=document.createElement("div");
    const title=document.createElement("strong");
    title.textContent=post.title;
    const details=document.createElement("small");
    details.textContent=post.platform+" • "+(post.date||"No date");
    info.append(title,details);

    const del=document.createElement("button");
    del.className="delete";
    del.textContent="Delete";
    del.addEventListener("click",()=>{
      posts.splice(index,1);
      saveData();
      renderPosts();
    });
    item.append(info,del);
    $("postList").append(item);
  });
}

$("addPost").addEventListener("click",()=>{
  const title=$("postTitle").value.trim();
  if(!title){
    alert("Please enter a post title.");
    return;
  }
  posts.push({
    title,
    platform:$("postPlatform").value,
    date:$("postDate").value
  });
  $("postTitle").value="";
  $("postDate").value="";
  saveData();
  renderPosts();
});

// Campaign manager
function renderCampaigns(){
  $("campaignList").innerHTML="";
  if(!campaigns.length){
    $("campaignList").textContent="No campaigns created yet.";
    return;
  }

  campaigns.forEach((campaign,index)=>{
    const item=document.createElement("div");
    item.className="saved-item";
    const info=document.createElement("div");
    const title=document.createElement("strong");
    title.textContent=campaign.name;
    const details=document.createElement("small");
    details.textContent=campaign.platform+" • PKR "+campaign.budget;
    info.append(title,details);

    const del=document.createElement("button");
    del.className="delete";
    del.textContent="Delete";
    del.addEventListener("click",()=>{
      campaigns.splice(index,1);
      saveData();
      renderCampaigns();
    });
    item.append(info,del);
    $("campaignList").append(item);
  });
}

$("addCampaign").addEventListener("click",()=>{
  const name=$("campaignName").value.trim();
  const budget=$("campaignBudget").value;

  if(!name){
    alert("Please enter a campaign name.");
    return;
  }
  if(budget==="" || Number(budget)<0){
    alert("Please enter a valid budget.");
    return;
  }

  campaigns.push({
    name,
    platform:$("campaignPlatform").value,
    budget:Number(budget)
  });

  $("campaignName").value="";
  $("campaignBudget").value="";
  saveData();
  renderCampaigns();
});

updateDashboard();
renderPosts();
renderCampaigns();