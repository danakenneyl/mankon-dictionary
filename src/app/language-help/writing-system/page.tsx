'use client';

import { useRef } from 'react';

export default function Writing() {
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});

  const playAudio = (id: string) => {
    const cached = audioCache.current[id];

    if (cached) {
      cached.currentTime = 0;      // restart if it’s still playing
      cached.play();
      return;
    }

    const audio = new Audio(`/audio/${id}.wav`);
    audioCache.current[id] = audio;
    audio.play();
  };

  return (
        <div className="content-wrapper">
          <div className="content">
          <section>
            <h1>Writing in Mankonː A Guide</h1>
            <div className="intro-decoration">
            <div className="decoration-line"></div>
            <div className="decoration-symbol"></div>
            <div className="decoration-line"></div>
            </div>
            <p className="center-text">There are currently two writing systems in use for the Mankon language. This guide provides a overview of both systems.</p>

          </section>

          <hr className="section-divider" />

          <section>
            <h2>The Mankon Alphabet</h2>
            <p>
              The Mankon Alphabet is the primary writing system used in modern Mankon language learning materials. It was popularized by Mr. Christopher Che Chi, a major figure in developing written resources for the Mankon language.
              <br></br><strong>Click on the letters below to hear their sounds.</strong>
            </p>
            
            <h3>Vowels</h3>
            <div className="letter-grid">
              <span><button className="alphabet" onClick={() => playAudio("a")}>a</button></span>
              <span><button className="alphabet" onClick={() => playAudio("e")}>e</button></span>
              <span><button className="alphabet" onClick={() => playAudio("ɛ")}>ɛ</button></span>
              <span><button className="alphabet" onClick={() => playAudio("ə")}>ə</button></span>
              <span><button className="alphabet" onClick={() => playAudio("i")}>i</button></span>
              <span><button className="alphabet" onClick={() => playAudio("ɨ")}>ɨ</button></span>
              <span><button className="alphabet" onClick={() => playAudio("o")}>o</button></span>
              <span><button className="alphabet" onClick={() => playAudio("ɔ")}>ɔ</button></span>
              <span><button className="alphabet" onClick={() => playAudio("u")}>u</button></span>
            </div>

            <h3>Consonants</h3>
            <div className="letter-grid">
            <span><button className="alphabet" onClick={() => playAudio("b")}>b</button></span>
            <span><button className="alphabet" onClick={() => playAudio("bv")}>bv</button></span>
            <span><button className="alphabet" onClick={() => playAudio("ch")}>tʃ</button></span>
            <span><button className="alphabet" onClick={() => playAudio("d")}>d</button></span>
            <span><button className="alphabet" onClick={() => playAudio("dv")}>dv</button></span>
            <span><button className="alphabet" onClick={() => playAudio("dz")}>dz</button></span>
            <span><button className="alphabet" onClick={() => playAudio("f")}>f</button></span>
            <span><button className="alphabet" onClick={() => playAudio("g")}>g</button></span>
            <span><button className="alphabet" onClick={() => playAudio("gv")}>gv</button></span>

            <span><button className="alphabet" onClick={() => playAudio("ɣ")}>ɣ</button></span>
            <span><button className="alphabet" onClick={() => playAudio("ʔ")}>ʔ</button></span>
            <span><button className="alphabet" onClick={() => playAudio("dʒ")}>dʒ</button></span>
            <span><button className="alphabet" onClick={() => playAudio("k")}>k</button></span>
            <span><button className="kf" onClick={() => playAudio("pf")}>kf pf</button></span>
            <span><button className="alphabet" onClick={() => playAudio("l")}>l</button></span>
            <span><button className="alphabet" onClick={() => playAudio("lv")}>lv</button></span>
            <span><button className="alphabet" onClick={() => playAudio("m")}>m</button></span>
            <span><button className="alphabet" onClick={() => playAudio("n")}>n</button></span>

            <span><button className="alphabet" onClick={() => playAudio("ɲ")}>ɲ</button></span>
            <span><button className="alphabet" onClick={() => playAudio("ŋ")}>ŋ</button></span>
            <span><button className="alphabet" onClick={() => playAudio("r")}>r</button></span>
            <span><button className="alphabet" onClick={() => playAudio("s")}>s</button></span>
            <span><button className="alphabet" onClick={() => playAudio("ʃ")}>ʃ</button></span>
            <span><button className="alphabet" onClick={() => playAudio("t")}>t</button></span>
            <span><button className="alphabet" onClick={() => playAudio("tf")}>tf</button></span>
            <span><button className="alphabet" onClick={() => playAudio("ts")}>ts</button></span>
            <span><button className="alphabet" onClick={() => playAudio("v")}>v</button></span>
            <span><button className="alphabet" onClick={() => playAudio("w")}>w</button></span>
            <span><button className="alphabet" onClick={() => playAudio("y")}>y</button></span>
            <span><button className="alphabet" onClick={() => playAudio("z")}>z</button></span>
            <span><button className="alphabet" onClick={() => playAudio("ʒ")}>ʒ</button></span>
            </div>
          </section>

          <hr className="section-divider" />

          <section>
            <h2>Writing Basics</h2>
            <p>Many of the letters in the Mankon Alphabet will appear familiar to English language writers. However, a few characters may be new. Letters that do not appear in the English alphabet are presented below with Mankon word and English word examples to demonstrate the sound the character represents. It is common to struggle at first when writing in a new way, but never fearǃ With consistant practice, writing in Mankon will feel like second nature.</p>
            <hr className="section-divider-mini" />
            <div className="letter-row">
              <span><button className="alphabet" onClick={() => playAudio("ɛ")}>ɛ</button></span>
              <p className="explanation"> This letter appears in the Mankon word for cloth, &quot;atsɛʔɛ&quot;, and the vowel sound appears in the English word &quot;bed&quot;.  </p>
            </div>
            <hr className="section-divider-mini" />
            <div className="letter-row">
            <span><button className="alphabet" onClick={() => playAudio("ə")}>ə</button></span>
              <p className="explanation">This letter appears in the Mankon word for fool, &quot;àbərɨ&quot;, and the vowel sound appears in the second syllable of the English word &quot;sofa&quot;.</p>
            </div>
            <hr className="section-divider-mini" />
            <div className="letter-row">
            <span><button className="alphabet" onClick={() => playAudio("ɨ")}>ɨ</button></span>
              <p className="explanation">This letter appears in the Mankon word for dance, &quot;àbɨ́ŋ&quot;. There is no equivalent in American English, however it is pronounced by some British dialects in the word &quot;category&quot;.</p>
            </div>
            <hr className="section-divider-mini"/>
            <div className="letter-row">
            <span><button className="alphabet" onClick={() => playAudio("ɔ")}>ɔ</button></span>
              <p className="explanation">This letter appears in the Mankon word for clay, &quot;àbɔm &quot;, and the vowel sound appears in the English word &quot;thought&quot;.</p>
            </div>
            <hr className="section-divider-mini" />
            <div className="letter-row">
            <span><button className="alphabet" onClick={() => playAudio("ch")}>tʃ</button></span>
              <p className="explanation">This letter appears in the Mankon word for shake, &quot;ʧìʔí &quot;, and the sound appears at the beginning of the English word &quot;chess&quot;.</p>
            </div>
            <hr className="section-divider-mini" />
            <div className="letter-row">
            <span><button className="alphabet" onClick={() => playAudio("ɣ")}>ɣ</button></span>
              <p className="explanation">This letter appears in the Mankon word for gum, &quot;àʧíɣɨ &quot;, There is no English equivalent.</p>
            </div>
            <hr className="section-divider-mini" />
            <div className="letter-row">
            <span><button className="alphabet" onClick={() => playAudio("ʔ")}>ʔ</button></span>
              <p className="explanation">This letter appears in the Mankon word for thigh, &quot;àtuʔu &quot;, and is pronounced in between the English words &quot;uh-oh&quot;</p>
            </div>
            <hr className="section-divider-mini" />
            <div className="letter-row">
            <span><button className="alphabet" onClick={() => playAudio("dʒ")}>dʒ</button></span>
              <p className="explanation">This letter appears in the Mankon word for Germany, &quot;dʒáman&quot;, and sound appears at the beginning of the English word &quot;jump&quot;</p>
            </div>
            <hr className="section-divider-mini" />
            <div className="letter-row">
              <span><button className="alphabet" onClick={() => playAudio("ɲ")}>ɛ</button></span>
              <p className="explanation">This letter appears in the Mankon name Anye, &quot;àɲɛ&quot;, and while English speakers typically use a slightly different pronounciation, the sound is approximated in the word &quot;canyon&quot;</p>
            </div>
            <hr className="section-divider-mini" />
            <div className="letter-row">
            <span><button className="alphabet" onClick={() => playAudio("ŋ")}>ŋ</button></span>
              <p className="explanation">This letter appears in the Mankon word for dance, &quot;àbɨ́ŋ&quot;, and the sound appears at the end of the English word &quot;song&quot;</p>
            </div>
            <hr className="section-divider-mini" />
            <div className="letter-row">
            <span><button className="alphabet" onClick={() => playAudio("ʃ")}>ʃ</button></span>
              <p className="explanation">This letter appears in the Mankon word for hunting, &quot;àʃwaʔa&quot;, and the sound appears at the beginning of the English word &quot;sheep&quot;</p>
            </div>
            <hr className="section-divider-mini" />
            <div className="letter-row">
            <span><button className="alphabet" onClick={() => playAudio("ʒ")}>ʒ</button></span>
              <p className="explanation">This letter appears in the Mankon word for breath, &quot;àʒwi&quot;, and the sound appears in the English word &quot;usual&quot;</p>
            </div>
          </section>

          <hr className="section-divider-mini" />

          <section>
            <h2> The Community-Based Teaching and Learning Alphabet (CABTAL)</h2>
            <p>
              The alphabet used by CABTAL heavily borrows from the standardized writing system developed for a diverse range of Cameroonian languages in 1979. The CABTAL alphabet is primarily used in Bible translations for Mankon. Recently, they have committed to developing a Mankon Dictionary in collaboration with SIL-Cameroon.
              CABTAL uses the same 9 vowels as the Mankon Alphabet, but represents all consonants using letters from the English Alphabet.
            </p>

            <h3>Vowels</h3>
              <div className="letter-grid">
              <span><button className="alphabet" onClick={() => playAudio("a")}>a</button></span>
              <span><button className="alphabet" onClick={() => playAudio("e")}>e</button></span>
              <span><button className="alphabet" onClick={() => playAudio("ɛ")}>ɛ</button></span>
              <span><button className="alphabet" onClick={() => playAudio("ə")}>ə</button></span>
              <span><button className="alphabet" onClick={() => playAudio("i")}>i</button></span>
              <span><button className="alphabet" onClick={() => playAudio("ɨ")}>ɨ</button></span>
              <span><button className="alphabet" onClick={() => playAudio("o")}>o</button></span>
              <span><button className="alphabet" onClick={() => playAudio("ɔ")}>ɔ</button></span>
              <span><button className="alphabet" onClick={() => playAudio("u")}>u</button></span>
              </div>

              <h3>Consonants</h3>
              <div className="letter-grid">
              <span><button className="alphabet" onClick={() => playAudio("b")}>b</button></span>
              <span><button className="alphabet" onClick={() => playAudio("bv")}>bv</button></span>
              <span><button className="alphabet" onClick={() => playAudio("ch")}>ch</button></span>
              <span><button className="alphabet" onClick={() => playAudio("d")}>d</button></span>
              <span><button className="alphabet" onClick={() => playAudio("dv")}>dv</button></span>
              <span><button className="alphabet" onClick={() => playAudio("dz")}>dz</button></span>
              <span><button className="alphabet" onClick={() => playAudio("f")}>f</button></span>
              <span><button className="alphabet" onClick={() => playAudio("g")}>g</button></span>
              <span><button className="alphabet" onClick={() => playAudio("gv")}>gv</button></span>

              <span><button className="alphabet" onClick={() => playAudio("ɣ")}>gh</button></span>
              <span><button className="alphabet" onClick={() => playAudio("ʔ")}>&apos;</button></span>
              <span><button className="alphabet" onClick={() => playAudio("dʒ")}>j</button></span>
              <span><button className="alphabet" onClick={() => playAudio("k")}>k</button></span>
              <span><button className="kf" onClick={() => playAudio("pf")}>kf pf</button></span>
              <span><button className="alphabet" onClick={() => playAudio("l")}>l</button></span>
              <span><button className="alphabet" onClick={() => playAudio("lv")}>lv</button></span>
              <span><button className="alphabet" onClick={() => playAudio("m")}>m</button></span>
              <span><button className="alphabet" onClick={() => playAudio("n")}>n</button></span>

              <span><button className="alphabet" onClick={() => playAudio("ɲ")}>ny</button></span>
              <span><button className="alphabet" onClick={() => playAudio("ŋ")}>ng</button></span>
              <span><button className="alphabet" onClick={() => playAudio("r")}>r</button></span>
              <span><button className="alphabet" onClick={() => playAudio("s")}>s</button></span>
              <span><button className="alphabet" onClick={() => playAudio("ʃ")}>sh</button></span>
              <span><button className="alphabet" onClick={() => playAudio("t")}>t</button></span>
              <span><button className="alphabet" onClick={() => playAudio("tf")}>tf</button></span>
              <span><button className="alphabet" onClick={() => playAudio("ts")}>ts</button></span>
              <span><button className="alphabet" onClick={() => playAudio("v")}>v</button></span>
              <span><button className="alphabet" onClick={() => playAudio("w")}>w</button></span>
              <span><button className="alphabet" onClick={() => playAudio("y")}>y</button></span>
              <span><button className="alphabet" onClick={() => playAudio("z")}>z</button></span>
              <span><button className="alphabet" onClick={() => playAudio("ʒ")}>zh</button></span>
              </div>
            <h3>Differences from the Mankon Alphabet</h3>
            <ul>
              <li>Mankon uses <strong>tʃ</strong> while GACL uses <strong>ch</strong>.</li>
              <li>Mankon uses <strong>ʃ</strong> while GACL uses <strong>sh</strong>.</li>
              <li>Mankon uses <strong>ʔ</strong> while GACL uses <strong>&apos;</strong> (apostrophe).</li>
              <li>Mankon uses <strong>ɣ</strong> while GACL uses <strong>gh</strong>.</li>
              <li>Mankon uses <strong>dʒ</strong> while GACL uses <strong>j</strong>.</li>
              <li>Mankon uses <strong>ʒ</strong> while GACL uses <strong>zh</strong>.</li>
              <li>Mankon uses <strong>ɲ</strong> while GACL uses <strong>ny</strong>.</li>
            </ul>
          </section>

          <hr className="section-divider" />

          <section>
            <h2>Notes for Readers</h2>
            <p>This dictionary will primarily be written using the Mankon Alphabet with CABTAL alternative spellings included where appropriate. Learning the Mankon Alphabet first is recommended for consistency with current and future Mankon learning materials and media.</p>
          </section>
          </div>
        </div>);
}