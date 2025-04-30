'use client'; 
import '@/styles/typing-mankon.css'
export default function Typing() {

  return (
        <div className="content-wrapper">
          <div className="content">
            <h1>Typing in Mankonː A Guide</h1>

            <div className="intro-decoration">
            <div className="decoration-line"></div>
            <div className="decoration-symbol"></div>
            <div className="decoration-line"></div>
            
            </div>

            <p className="center-text">Typing in Mankon can be easy, but because Mankon has a few special letters, you&apos;ll need to download a new keyboard! Follow these steps to get started.</p>
            <hr className="section-divider" />
            <section>
              <h2>Step 1: Download the Keyboard on Your Computer</h2>
              <p>To type in Mankon, install the <strong>Keyman IPA SIL Keyboard</strong>:</p>
              <ul>
                <li><a href="https://keyman.com/keyboards/sil_ipa" target="_blank" rel="noopener noreferrer">Download Keyman IPA SIL Keyboard</a></li>
              </ul>
            </section>
            <hr className="section-divider" />
            <section>
              <h2>Step 2: Understand the Alphabet You’ll See</h2>
              <p>The Mankon Dictionary offers a brief lesson on the Mankon writing system linked below.</p>
              <ul>
              <li><a href="/language-help/writing-system" target="_blank" rel="noopener noreferrer">Mankon Alphabet Guide</a></li>
              </ul>
              <p>Luckily, many Mankon letters can be typed using any standard keyboard! </p>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Standard Letters</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>a</td></tr>
                    <tr><td>b</td></tr>
                    <tr><td>bv</td></tr>
                    <tr><td>d</td></tr>
                    <tr><td>dv</td></tr>
                    <tr><td>dz</td></tr>
                    <tr><td>e</td></tr>
                    <tr><td>g</td></tr>
                    <tr><td>gv</td></tr>
                    <tr><td>i</td></tr>
                    <tr><td>k</td></tr>
                    <tr><td>kf</td></tr>
                    <tr><td>l</td></tr>
                    <tr><td>lv</td></tr>
                    <tr><td>m</td></tr>
                    <tr><td>n</td></tr>
                    <tr><td>o</td></tr>
                    <tr><td>pf</td></tr>
                    <tr><td>r</td></tr>
                    <tr><td>s</td></tr>
                    <tr><td>t</td></tr>
                    <tr><td>tf</td></tr>
                    <tr><td>ts</td></tr>
                    <tr><td>u</td></tr>
                    <tr><td>v</td></tr>
                    <tr><td>w</td></tr>
                    <tr><td>y</td></tr>
                    <tr><td>z</td></tr>
                    <tr><td>ky</td></tr>
                    <tr><td>ts</td></tr>
                  </tbody>
                </table>
              </div>
              
              <div className="table-container">
              <p>Only a few Mankon letters must be typed using a special sequence of keys.</p>
                <table>
                  <thead>
                    <tr>
                      <th>Letter</th>
                      <th>Key Sequence</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>tʃ</td><td>ts=</td></tr>
                    <tr><td>dʒ</td><td>dz=</td></tr>
                    <tr><td>ə</td><td>e=</td></tr>
                    <tr><td>ɣ</td><td>g=</td></tr>
                    <tr><td>ɨ</td><td>I=</td></tr>
                    <tr><td>ɲ</td><td>ɲ</td></tr>
                    <tr><td>ŋ</td><td>n&gt;</td></tr>
                    <tr><td>ɔ</td><td>o&lt;</td></tr>
                    <tr><td>ɣ</td><td>g=</td></tr>
                    <tr><td>ʃ</td><td>s=</td></tr>
                    <tr><td>ʒ</td><td>z=</td></tr>
                    <tr><td>ʔ</td><td>?=</td></tr>
                  </tbody>
                </table>
                <p><strong>Tip:</strong> &quot;Shift&quot; + &quot;comma&quot; types &quot;&lt;&quot; on most keyboards, so when you see Letter&lt;, follow these steps: </p>
                <p>1. press the letter key </p>
                <p>2. release the letter key </p>
                <p>3. press the Shift key and the comma key at the same time</p>
              </div>
            </section>
            <hr className="section-divider" />
            <section>
              <h2>Step 3: Typing Tone in Mankon</h2>
              <p>Four types of tones are marked in Mankon:</p>
              <ul>
                <li><strong>Low</strong> (<em>à</em>)</li>
                <li><strong>High</strong> (<em>á</em>)</li>
                <li><strong>Rising</strong> (<em>ǎ</em>)</li>
                <li><strong>Falling</strong> (<em>â</em>)</li>
              </ul>

              <p>To type tones using the IPA SIL Keyboard:</p>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Tone Type</th>
                      <th>How to Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Low</td><td>Letter + @1</td></tr>
                    <tr><td>High</td><td>Letter + @3</td></tr>
                    <tr><td>Rising (Low-High)</td><td>Letter + @13</td></tr>
                    <tr><td>Falling (High-Low)</td><td>Letter + @31</td></tr>
                  </tbody>
                </table>
              </div>

              <p><strong>Tip:</strong> &quot;Shift + 2&quot; types <code>@</code> on most keyboards, so when you see &quot;@1&quot;, it means Shift-2 then 1.</p>
            </section>
          </div>
        </div>
      );
}