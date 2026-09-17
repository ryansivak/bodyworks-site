import { demo, slotsFor } from './booking-config.js';
const app = document.querySelector('#booking-app');
let step = 1, service = '', day = '', time = '', status = '', monthOffset = 0;
const todayParts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone:demo.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
const today = new Date(Date.UTC(Number(todayParts.year),Number(todayParts.month)-1,Number(todayParts.day)));
const dayKey = d => d.toISOString().slice(0,10);
const dateFor = key => new Date(key+'T12:00:00Z');
const formatDay = key => dateFor(key).toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric',weekday:'short'});
const clock = n => `${Math.floor(n/60)%12||12}:${String(n%60).padStart(2,'0')} ${n<720?'AM':'PM'}`;
const chosen = () => demo.services.find(s=>s.id===service);
const maxDay = new Date(today); maxDay.setUTCDate(today.getUTCDate()+42);
const maxMonthOffset = (maxDay.getUTCFullYear()-today.getUTCFullYear())*12+maxDay.getUTCMonth()-today.getUTCMonth();
const busyFor = key => dateFor(key).getUTCDay()===1 ? demo.busy : [];
function calendar() {
  const view = new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth()+monthOffset,1));
  const count = new Date(Date.UTC(view.getUTCFullYear(),view.getUTCMonth()+1,0)).getUTCDate();
  let cells = '<span aria-hidden="true"></span>'.repeat(view.getUTCDay());
  for(let n=1;n<=count;n++) {
    const date = new Date(Date.UTC(view.getUTCFullYear(),view.getUTCMonth(),n));
    const key = dayKey(date);
    const available = date>today && date<=maxDay && date.getUTCDay()!==0;
    cells += `<button class="date-button" data-day="${key}" aria-label="${formatDay(key)}, sample date" aria-pressed="${day===key}" ${available?'':'disabled'}>${n}</button>`;
  }
  return `<div class="calendar-header"><button data-month="-1" aria-label="Previous month" ${monthOffset===0?'disabled':''}>←</button><strong>${view.toLocaleDateString('en-US',{timeZone:'UTC',month:'long',year:'numeric'})}</strong><button data-month="1" aria-label="Next month" ${monthOffset>=maxMonthOffset?'disabled':''}>→</button></div><div class="calendar-grid">${['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>`<span class="weekday">${d}</span>`).join('')}${cells}</div>`;
}
function render(focus=false) {
  const progress = `<ol class="progress" aria-label="Booking progress">${['Session','Date & time','Review'].map((s,i)=>`<li ${step===i+1?'aria-current="step"':''} class="${step>i+1?'completed':''}"><span>${step>i+1?'✓':i+1}</span>${s}</li>`).join('')}</ol>`;
  let body = '';
  if(step===1) body = `<h3 class="step-heading" tabindex="-1">Choose a sample session length</h3><div class="choice-grid" role="group" aria-label="Sample session length">${demo.services.map(s=>`<button class="choice" data-service="${s.id}" aria-pressed="${service===s.id}" aria-label="${s.minutes} minutes, sample appointment"><span class="choice-check" aria-hidden="true">✓</span><strong>${s.minutes} <small>min</small></strong><small>Example only</small></button>`).join('')}</div><p class="step-note">Actual session lengths and prices are still being confirmed.</p><div class="booking-actions"><button class="button next" ${!service?'disabled':''}>Choose a date & time <span aria-hidden="true">→</span></button></div>`;
  if(step===2) {
    const slots = day?slotsFor(chosen().minutes,busyFor(day)):[];
    body = `<h3 class="step-heading" tabindex="-1">Choose a sample date & time</h3>${calendar()}<fieldset class="time-section"><legend>${day?formatDay(day)+' · sample start times':'Select a highlighted date'}</legend><div class="slot-grid">${!day?'<p class="step-note">All dates are demonstration availability.</p>':slots.length?slots.map(t=>`<button class="slot" data-time="${t}" aria-pressed="${time===String(t)}">${clock(t)}</button>`).join(''):'<p class="no-times" role="status">No sample times fit this session. Please choose another date.</p>'}</div></fieldset><p class="step-note">Sample Eastern time · Includes time between appointments.</p><div class="booking-actions"><button class="back">Back</button><button class="button next" ${!time?'disabled':''}>Review request <span aria-hidden="true">→</span></button></div>`;
  }
  if(step===3) body = `<h3 class="step-heading" tabindex="-1">Review your sample request</h3><dl class="summary-list"><div><dt>Session</dt><dd>${chosen().minutes} minutes · sample</dd></div><div><dt>Date</dt><dd>${formatDay(day)}</dd></div><div><dt>Time</dt><dd>${clock(Number(time))}–${clock(Number(time)+chosen().minutes)}<br>Sample Eastern time</dd></div><div><dt>Guest</dt><dd>Sample guest</dd></div></dl><p class="step-note">A real request would ask for your name and contact details. This preview uses a sample guest and sends nothing.</p><div class="booking-actions"><button class="back">Back</button><button class="button next">Preview request <span aria-hidden="true">→</span></button></div>`;
  if(step===4) body = `<div class="demo-result" role="status"><span class="result-symbol" aria-hidden="true">${status==='declined'?'−':'✓'}</span><h3 class="step-heading" tabindex="-1">${status==='pending'?'Sample request ready for review':status==='approved'?'Sample appointment approved':'Sample request declined'}</h3><p>${chosen().minutes} minutes · ${formatDay(day)}<br>${clock(Number(time))} · sample Eastern time</p><p><strong>No real appointment was booked.</strong><br>Nothing was saved or sent.</p></div><details class="owner-preview"><summary>See the sample practice review</summary><p>Preview how Les could review a request. This is not a live practice account.</p>${status==='pending'?'<div class="booking-actions"><button class="button" data-action="approved">Approve sample</button><button class="secondary-button" data-action="declined">Decline sample</button></div>':'<p>Sample decision shown for this preview only.</p>'}</details><button class="restart">Try another sample appointment</button>`;
  app.innerHTML = (step<4?progress:'')+body+'<p class="preview-foot">Preview only · No personal information collected</p>';
  app.querySelectorAll('[data-service]').forEach(b=>b.addEventListener('click',()=>{service=b.dataset.service;day=time='';render();app.querySelector(`[data-service="${service}"]`).focus();}));
  app.querySelectorAll('[data-month]').forEach(b=>b.addEventListener('click',()=>{monthOffset+=Number(b.dataset.month);day=time='';render(true);}));
  app.querySelectorAll('[data-day]').forEach(b=>b.addEventListener('click',()=>{day=b.dataset.day;time='';render();app.querySelector(`[data-day="${day}"]`).focus();}));
  app.querySelectorAll('[data-time]').forEach(b=>b.addEventListener('click',()=>{time=b.dataset.time;render();app.querySelector(`[data-time="${time}"]`).focus();}));
  app.querySelector('.next')?.addEventListener('click',()=>{step++;if(step===4)status='pending';render(true);});
  app.querySelector('.back')?.addEventListener('click',()=>{step--;render(true);});
  app.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{status=b.dataset.action;render(true);}));
  app.querySelector('.restart')?.addEventListener('click',()=>{step=1;service=day=time=status='';monthOffset=0;render(true);});
  if(focus) app.querySelector('.step-heading').focus();
}
render();

