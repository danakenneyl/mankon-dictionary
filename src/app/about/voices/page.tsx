import "@/styles/guide.css"
import "@/styles/home.css"
import Image from "next/image"
import "@/styles/voices.css"

export default function Voices() {
    return (
      <div className="flex justify-center">
        <div className="content-wrapper">
          <div className="content">
            
            <section className="max-w-3xl mx-auto p-6">
              <h1 className="text-4xl font-bold mb-6 text-center">Founding Voices</h1>
              <div className="intro-decoration">
              <div className="decoration-line"></div>
              <div className="decoration-symbol"></div>
              <div className="decoration-line"></div>
              </div>
            </section>
              
            {/* Voice 1 */}
            <div className="bio-container">
              <div className="bio-name">
                <h2 className="text-2xl font-semibold mb-3">Mr. Samuel Fonteh</h2>
              </div>
              <div className="bio-image">
                <Image
                  src="/images/SamuelFonteh.jpeg"
                  alt="Dr. Samuel Fonteh"
                  className="bio-img"
                  width={325}
                  height={361}
                />
              </div>
              <div className="bio-text">
                <p>Samuel Fonteh is a proud son of Mankon, recognized for his outstanding contributions to education, community development, and cultural preservation. As a student leader, he was with the team that initiated the idea of a community library to promote literacy and lifelong learning among Mankon youth, setting the stage for his future leadership. Trained as a Civil Engineer, Project Manager, and Data Scientist, Mr. Fonteh has skillfully combined his professional expertise with a strong commitment to community service.</p>
            
                <p>He played a key role in the design and construction of the MACUDA Hall in Yaoundé, Cameroon, and contributed significantly to the improvement of public health infrastructure by conceiving plans for a modern public toilet block and VIP toilets in the Mankon palace. His love for documenting the Mankon culture is seen when he coauthored the publication of two books on the Mankon dialect that were made available globally through Amazon, strengthening the visibility of Mankon heritage.</p>
                
                <p>Currently, Mr. Fonteh is supporting MACUDA Minnesota&apos;s efforts to acquire a community center in the Twin Cities, in MN, USA. As an active and passionate member of the Online Mankon Dictionary Committee, he remains deeply committed to assisting in documenting and promoting the Mankon language for generations to come.</p>
              </div>
            </div>

            {/* Voice n */}
            <div className="bio-container">
              <div className="bio-name">
                <h2 className="text-2xl font-semibold mb-3">Dana Kenney-Lillejord</h2>
              </div>
              <div className="bio-image">
                <Image
                  src="/images/photo.jpg"
                  alt="Dr. Samuel Fonteh"
                  className="bio-img"
                  width={325}
                  height={361}
                />
              </div>
              <div className="bio-text">
                <p>  Dana Kenney-Lillejord is currently pursuing an undergraduate degree in Computer Science and Linguistics at the University of Minnesota - Twin Cities. Her research interests are grounded in low-resource language work, and she recently completed her honors thesis exploring the phonology of Mankon. Dana strives to uphold high ethical standards in her research which guides her work always towards achieving the community goals of her language of focus. In return for the help she received with her research, she proposed the creation of an online living-breathing searchable Mankon dictionary that could engage Mankon communities around the world. With this project, she aspires to create a generalizable documentation tool that can benefit any language community interested in documenting their own language. In the future, she hopes to explore the possibility of building AI tools for languages like Mankon with limited online resources.</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    )
  }


