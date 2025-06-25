<xsl:stylesheet version="1.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:cv="http://portfolio.gouzerh.fr/cv"
                xmlns="http://www.w3.org/1999/xhtml">

  <xsl:param name="langue" select="'fr-FR'"/>
  
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/cv:cv">
    <html xmlns="http://www.w3.org/1999/xhtml" 
          xmlns:schema="https://schema.org/" 
          typeof="schema:Person">
      <xsl:attribute name="lang">
        <xsl:value-of select="substring-before($langue, '-')"/>
      </xsl:attribute>
      
      <head>
        <meta charset="UTF-8"/>
        <title>
          <xsl:value-of select="cv:identite/cv:titre/cv:traduction[@lang=$langue]"/>
          - <xsl:value-of select="cv:identite/cv:prenom"/>
          <xsl:text> </xsl:text>
          <xsl:value-of select="cv:identite/cv:nom"/>
        </title>
        
        <!-- Métadonnées RDFa Schema.org -->
        <meta property="schema:name" content="{cv:identite/cv:prenom} {cv:identite/cv:nom}"/>
        <meta property="schema:jobTitle" content="{cv:identite/cv:titre/cv:traduction[@lang=$langue]}"/>
        <meta property="schema:birthDate" content="{cv:identite/cv:dateNaissance}"/>
        <meta property="schema:nationality" content="{cv:identite/cv:nationalite/cv:traduction[@lang=$langue]}"/>
        
        <!-- Liens vers autres versions linguistiques -->
        <xsl:for-each select="cv:metadata/cv:languesDisponibles/cv:langue[. != $langue]">
          <link rel="alternate" hreflang="{.}" href="?lang={.}"/>
        </xsl:for-each>
        
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            display: flex; 
            min-height: 100vh; 
          }
          
          .sidebar { 
            width: 350px; 
            background: #2c3e50; 
            color: white; 
            padding: 20px; 
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            left: 0;
            top: 0;
          }
          
          .main-content { 
            margin-left: 350px;
            flex: 1; 
            padding: 20px 40px; 
            background: white; 
            min-height: 100vh;
          }
          
          .lang-selector { 
            position: fixed; 
            top: 10px; 
            right: 10px; 
            z-index: 1000; 
          }
          
          .lang-button { 
            margin: 0 5px; 
            padding: 5px 10px; 
            background: #f0f0f0; 
            border: 1px solid #ccc; 
            text-decoration: none; 
            color: #333; 
            border-radius: 3px;
          }
          
          .lang-button.active { 
            background: #333; 
            color: white; 
          }
          
          .sidebar h3 {
            color: #ecf0f1;
            font-size: 14px;
            margin: 25px 0 12px 0;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 1px;
            border-bottom: 1px solid #34495e;
            padding-bottom: 5px;
          }
          
          .sidebar ul {
            list-style: none;
            padding: 0;
            margin: 0 0 15px 0;
          }
          
          .sidebar li {
            margin: 6px 0;
            color: #bdc3c7;
            font-size: 13px;
            line-height: 1.4;
          }
          
          .sidebar strong {
            color: #ecf0f1;
            font-weight: bold;
          }
          
          .header { 
            text-align: center; 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 20px; 
            margin-bottom: 40px; 
          }
          
          .header h1 {
            color: #2c3e50;
            font-size: 32px;
            margin-bottom: 10px;
          }
          
          .header h2 {
            color: #3498db;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: normal;
          }
          
          .section { 
            margin-bottom: 40px; 
          }
          
          .section-title { 
            font-size: 22px; 
            font-weight: bold; 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 8px;
            margin-bottom: 25px; 
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .item { 
            margin-bottom: 25px; 
            padding: 20px; 
            border-left: 4px solid #3498db;
            background: #f8f9fa;
            border-radius: 0 5px 5px 0;
          }
          
          .item-title { 
            font-weight: bold; 
            color: #2c3e50; 
            font-size: 18px;
            margin-bottom: 8px;
          }
          
          .item-subtitle { 
            color: #7f8c8d; 
            font-size: 16px;
            margin-bottom: 8px;
          }
          
          .item-period {
            background: #3498db;
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            display: inline-block;
            margin-bottom: 12px;
            font-weight: bold;
          }
          
          .item ul {
            margin: 15px 0 0 20px;
          }
          
          .item li {
            margin: 8px 0;
            color: #2c3e50;
          }
          
          .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .project-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #e74c3c;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          
          .project-category {
            color: #e74c3c;
            font-size: 18px;
            font-weight: bold;
            margin: 30px 0 15px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .centers-container {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
          }
          
          .center-item {
            background: #f8f9fa;
            padding: 12px 20px;
            border-radius: 25px;
            border: 2px solid #ecf0f1;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          
          @media (max-width: 1200px) {
            .sidebar {
              width: 300px;
            }
            .main-content {
              margin-left: 300px;
              padding: 20px;
            }
          }
          
          @media (max-width: 768px) {
            .sidebar {
              position: static;
              width: 100%;
              height: auto;
            }
            .main-content {
              margin-left: 0;
            }
          }
        </style>
      </head>
      
      <body>
        <!-- Sélecteur de langue -->
        <div class="lang-selector">
          <xsl:for-each select="cv:metadata/cv:languesDisponibles/cv:langue">
            <a class="lang-button">
              <xsl:attribute name="href">
                <xsl:choose>
                  <xsl:when test=". = 'fr-FR'">cv_fr.html</xsl:when>
                  <xsl:when test=". = 'en-GB'">cv_en.html</xsl:when>
                  <xsl:when test=". = 'zh-CN'">cv_zh.html</xsl:when>
                </xsl:choose>
              </xsl:attribute>
              <xsl:if test=". = $langue">
                <xsl:attribute name="class">lang-button active</xsl:attribute>
              </xsl:if>
              <xsl:choose>
                <xsl:when test=". = 'fr-FR'">🇫🇷 FR</xsl:when>
                <xsl:when test=". = 'en-GB'">🇬🇧 EN</xsl:when>
                <xsl:when test=". = 'zh-CN'">🇨🇳 中文</xsl:when>
              </xsl:choose>
            </a>
          </xsl:for-each>
        </div>
        
        <!-- Sidebar -->
        <div class="sidebar">
          <!-- Contact -->
          <h3>
            <xsl:choose>
              <xsl:when test="$langue='fr-FR'">Contact</xsl:when>
              <xsl:when test="$langue='en-GB'">Contact</xsl:when>
              <xsl:when test="$langue='zh-CN'">联系方式</xsl:when>
            </xsl:choose>
          </h3>
          <ul>
            <xsl:for-each select="cv:contacts/cv:contact">
              <li>
                <strong><xsl:value-of select="cv:libelle/cv:traduction[@lang=$langue]"/>:</strong>
                <xsl:text> </xsl:text>
                <span>
                  <xsl:if test="cv:type = 'email'">
                    <xsl:attribute name="property">schema:email</xsl:attribute>
                  </xsl:if>
                  <xsl:if test="cv:type = 'telephone'">
                    <xsl:attribute name="property">schema:telephone</xsl:attribute>
                  </xsl:if>
                  <xsl:value-of select="cv:valeur"/>
                </span>
              </li>
            </xsl:for-each>
          </ul>
          
          <!-- Soft Skills -->
          <h3>
            <xsl:choose>
              <xsl:when test="$langue='fr-FR'">Soft Skills</xsl:when>
              <xsl:when test="$langue='en-GB'">Soft Skills</xsl:when>
              <xsl:when test="$langue='zh-CN'">软技能</xsl:when>
            </xsl:choose>
          </h3>
          <ul>
            <xsl:for-each select="cv:competences/cv:competencesTechniques/cv:competence[@categorie='autre']">
              <li><xsl:value-of select="cv:nom/cv:traduction[@lang=$langue]"/></li>
            </xsl:for-each>
          </ul>
          
          <!-- Hard Skills -->
          <h3>
            <xsl:choose>
              <xsl:when test="$langue='fr-FR'">Hard Skills</xsl:when>
              <xsl:when test="$langue='en-GB'">Hard Skills</xsl:when>
              <xsl:when test="$langue='zh-CN'">硬技能</xsl:when>
            </xsl:choose>
          </h3>
          <ul>
            <xsl:for-each select="cv:competences/cv:competencesTechniques/cv:competence[@categorie='programmation' or @categorie='methodologie' or @categorie='outils']">
              <li>
                <strong><xsl:value-of select="cv:nom/cv:traduction[@lang=$langue]"/></strong>
                <xsl:if test="cv:description">
                  : <xsl:value-of select="cv:description/cv:traduction[@lang=$langue]"/>
                </xsl:if>
              </li>
            </xsl:for-each>
          </ul>
          
          <!-- Langues -->
          <h3>
            <xsl:choose>
              <xsl:when test="$langue='fr-FR'">Langues</xsl:when>
              <xsl:when test="$langue='en-GB'">Languages</xsl:when>
              <xsl:when test="$langue='zh-CN'">语言</xsl:when>
            </xsl:choose>
          </h3>
          <ul>
            <xsl:for-each select="cv:competences/cv:competencesLangues/cv:langue">
              <li property="schema:knowsLanguage" typeof="schema:Language">
                <strong property="schema:name"><xsl:value-of select="cv:nom/cv:traduction[@lang=$langue]"/></strong>
                - <xsl:value-of select="cv:niveauTexte/cv:traduction[@lang=$langue]"/>
              </li>
            </xsl:for-each>
          </ul>
          
          <!-- Expériences Complémentaires -->
          <h3>
            <xsl:choose>
              <xsl:when test="$langue='fr-FR'">Expériences Complémentaires</xsl:when>
              <xsl:when test="$langue='en-GB'">Complementary Experience</xsl:when>
              <xsl:when test="$langue='zh-CN'">补充经验</xsl:when>
            </xsl:choose>
          </h3>
          <ul>
            <xsl:for-each select="cv:experiences/cv:experience[@type='complementaire']">
              <li>
                <strong><xsl:value-of select="cv:poste/cv:traduction[@lang=$langue]"/></strong><br/>
                (<xsl:choose>
                  <xsl:when test="$langue='fr-FR'">depuis </xsl:when>
                  <xsl:when test="$langue='en-GB'">since </xsl:when>
                  <xsl:when test="$langue='zh-CN'">自 </xsl:when>
                </xsl:choose>
                <xsl:value-of select="cv:periode/cv:debut"/>
                <xsl:if test="cv:periode/cv:fin">
                  <xsl:choose>
                    <xsl:when test="$langue='fr-FR'"> à </xsl:when>
                    <xsl:when test="$langue='en-GB'"> to </xsl:when>
                    <xsl:when test="$langue='zh-CN'"> 至 </xsl:when>
                  </xsl:choose>
                  <xsl:value-of select="cv:periode/cv:fin"/>
                </xsl:if>)<br/>
                <xsl:if test="cv:taches">
                  <xsl:for-each select="cv:taches/cv:tache">
                    <xsl:value-of select="cv:traduction[@lang=$langue]"/>
                    <xsl:if test="position() != last()"><br/></xsl:if>
                  </xsl:for-each>
                </xsl:if>
              </li>
            </xsl:for-each>
          </ul>
        </div>
        
        <!-- Contenu principal -->
        <div class="main-content">
          <!-- En-tête avec RDFa -->
          <div class="header">
            <h1 property="schema:name">
              <xsl:value-of select="cv:identite/cv:prenom"/>
              <xsl:text> </xsl:text>
              <xsl:value-of select="cv:identite/cv:nom"/>
            </h1>
            <h2 property="schema:jobTitle">
              <xsl:value-of select="cv:identite/cv:titre/cv:traduction[@lang=$langue]"/>
            </h2>
            <div property="schema:description">
              <xsl:value-of select="cv:identite/cv:presentation/cv:traduction[@lang=$langue]"/>
            </div>
          </div>
          
          <!-- Formation -->
          <div class="section">
            <h3 class="section-title">
              <xsl:choose>
                <xsl:when test="$langue='fr-FR'">Formation</xsl:when>
                <xsl:when test="$langue='en-GB'">Education</xsl:when>
                <xsl:when test="$langue='zh-CN'">教育经历</xsl:when>
              </xsl:choose>
            </h3>
            <xsl:for-each select="cv:formations/cv:formation">
              <xsl:sort select="cv:periode/cv:debut" order="descending"/>
              <div class="item" typeof="schema:EducationalOrganization">
                <div class="item-title" property="schema:name">
                  <xsl:value-of select="cv:diplome/cv:traduction[@lang=$langue]"/>
                </div>
                <div class="item-period">
                  <xsl:choose>
                    <xsl:when test="cv:periode/cv:fin">
                      <xsl:value-of select="cv:periode/cv:debut"/>/<xsl:value-of select="cv:periode/cv:fin"/>
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:choose>
                        <xsl:when test="$langue='fr-FR'">Depuis sept </xsl:when>
                        <xsl:when test="$langue='en-GB'">Since Sept </xsl:when>
                        <xsl:when test="$langue='zh-CN'">自9月 </xsl:when>
                      </xsl:choose>
                      <xsl:value-of select="cv:periode/cv:debut"/>
                    </xsl:otherwise>
                  </xsl:choose>
                </div>
                <div class="item-subtitle" property="schema:location">
                  <strong><xsl:value-of select="cv:etablissement/cv:traduction[@lang=$langue]"/></strong>, 
                  <xsl:value-of select="cv:lieu/cv:traduction[@lang=$langue]"/>
                </div>
                <xsl:if test="cv:options">
                  <div style="margin-top: 10px;">
                    <strong>Options : </strong><xsl:value-of select="cv:options/cv:traduction[@lang=$langue]"/>
                  </div>
                </xsl:if>
              </div>
            </xsl:for-each>
          </div>
          
          <!-- Expériences Professionnelles -->
          <div class="section">
            <h3 class="section-title">
              <xsl:choose>
                <xsl:when test="$langue='fr-FR'">Expériences Professionnelles</xsl:when>
                <xsl:when test="$langue='en-GB'">Work Experience</xsl:when>
                <xsl:when test="$langue='zh-CN'">工作经验</xsl:when>
              </xsl:choose>
            </h3>
            <xsl:for-each select="cv:experiences/cv:experience[@type='professionnel']">
              <xsl:sort select="cv:periode/cv:debut" order="descending"/>
              <div class="item" typeof="schema:WorkExperience">
                <div class="item-title" property="schema:jobTitle">
                  <xsl:value-of select="cv:poste/cv:traduction[@lang=$langue]"/>
                </div>
                <div class="item-period">
                  <xsl:choose>
                    <xsl:when test="cv:periode/cv:fin">
                      <strong><xsl:value-of select="cv:periode/cv:debut"/> - <xsl:value-of select="cv:periode/cv:fin"/></strong>
                    </xsl:when>
                    <xsl:otherwise>
                      <strong>
                        <xsl:choose>
                          <xsl:when test="$langue='fr-FR'">depuis sept </xsl:when>
                          <xsl:when test="$langue='en-GB'">since Sept </xsl:when>
                          <xsl:when test="$langue='zh-CN'">自9月 </xsl:when>
                        </xsl:choose>
                        <xsl:value-of select="cv:periode/cv:debut"/>
                      </strong>
                    </xsl:otherwise>
                  </xsl:choose>
                </div>
                <div class="item-subtitle">
                  <span property="schema:worksFor" typeof="schema:Organization">
                    <strong property="schema:name"><xsl:value-of select="cv:entreprise/cv:traduction[@lang=$langue]"/></strong>
                  </span>, 
                  <xsl:value-of select="cv:lieu/cv:traduction[@lang=$langue]"/>
                </div>
                <xsl:if test="cv:taches">
                  <ul>
                    <xsl:for-each select="cv:taches/cv:tache">
                      <li><xsl:value-of select="cv:traduction[@lang=$langue]"/></li>
                    </xsl:for-each>
                  </ul>
                </xsl:if>
              </div>
            </xsl:for-each>
          </div>
          
          <!-- Projets Informatiques -->
          <div class="section">
            <h3 class="section-title">
              <xsl:choose>
                <xsl:when test="$langue='fr-FR'">Projets Informatiques</xsl:when>
                <xsl:when test="$langue='en-GB'">Computer Projects</xsl:when>
                <xsl:when test="$langue='zh-CN'">计算机项目</xsl:when>
              </xsl:choose>
            </h3>
            
            <!-- Section JEUX -->
            <div class="project-category">
              <xsl:choose>
                <xsl:when test="$langue='fr-FR'">JEUX</xsl:when>
                <xsl:when test="$langue='en-GB'">GAMES</xsl:when>
                <xsl:when test="$langue='zh-CN'">游戏</xsl:when>
              </xsl:choose>
            </div>
            <div class="projects-grid">
              <xsl:for-each select="cv:projets/cv:projet[contains(cv:nom/cv:traduction[@lang=$langue], 'Puissance') or contains(cv:nom/cv:traduction[@lang=$langue], 'Pac Man')]">
                <div class="project-item" typeof="schema:CreativeWork">
                  <div style="font-weight: bold; color: #2c3e50; margin-bottom: 10px;" property="schema:name">
                    <xsl:value-of select="cv:nom/cv:traduction[@lang=$langue]"/>
                  </div>
                  <div property="schema:description" style="margin-bottom: 10px;">
                    <xsl:value-of select="cv:description/cv:traduction[@lang=$langue]"/>
                  </div>
                  <xsl:if test="cv:technologies">
                    <div style="font-size: 12px; color: #7f8c8d;">
                      <strong>Technologies : </strong><xsl:value-of select="cv:technologies/cv:traduction[@lang=$langue]"/>
                    </div>
                  </xsl:if>
                </div>
              </xsl:for-each>
            </div>
            
            <!-- Section ALGORITHME -->
            <div class="project-category">
              <xsl:choose>
                <xsl:when test="$langue='fr-FR'">ALGORITHME</xsl:when>
                <xsl:when test="$langue='en-GB'">ALGORITHM</xsl:when>
                <xsl:when test="$langue='zh-CN'">算法</xsl:when>
              </xsl:choose>
            </div>
            <div class="projects-grid">
              <xsl:for-each select="cv:projets/cv:projet[not(contains(cv:nom/cv:traduction[@lang=$langue], 'Puissance') or contains(cv:nom/cv:traduction[@lang=$langue], 'Pac Man'))]">
                <div class="project-item" typeof="schema:CreativeWork">
                  <div style="font-weight: bold; color: #2c3e50; margin-bottom: 10px;" property="schema:name">
                    <xsl:value-of select="cv:nom/cv:traduction[@lang=$langue]"/>
                  </div>
                  <div property="schema:description" style="margin-bottom: 10px;">
                    <xsl:value-of select="cv:description/cv:traduction[@lang=$langue]"/>
                  </div>
                  <xsl:if test="cv:technologies">
                    <div style="font-size: 12px; color: #7f8c8d;">
                      <strong>Technologies : </strong><xsl:value-of select="cv:technologies/cv:traduction[@lang=$langue]"/>
                    </div>
                  </xsl:if>
                </div>
              </xsl:for-each>
            </div>
          </div>
          
          <!-- Centres d'intérêt -->
          <div class="section">
            <h3 class="section-title">
              <xsl:choose>
                <xsl:when test="$langue='fr-FR'">Centres d'intérêt</xsl:when>
                <xsl:when test="$langue='en-GB'">Interests</xsl:when>
                <xsl:when test="$langue='zh-CN'">兴趣爱好</xsl:when>
              </xsl:choose>
            </h3>
            <div class="centers-container">
              <xsl:for-each select="cv:centresInteret/cv:centre">
                <div class="center-item">
                  <span><xsl:value-of select="cv:icone"/></span>
                  <span><xsl:value-of select="cv:nom/cv:traduction[@lang=$langue]"/></span>
                </div>
              </xsl:for-each>
            </div>
          </div>

          <!-- Section Vidéo de Présentation -->
          <div class="section">
            <h3 class="section-title">
              <xsl:choose>
                <xsl:when test="$langue='fr-FR'">Présentation Vidéo</xsl:when>
                <xsl:when test="$langue='en-GB'">Video Presentation</xsl:when>
                <xsl:when test="$langue='zh-CN'">视频介绍</xsl:when>
              </xsl:choose>
            </h3>
            
            <div class="video-container">
              <xsl:choose>
                <xsl:when test="$langue='fr-FR'">
                  <iframe width="560" height="315" 
                          src="https://www.youtube.com/embed/VOTRE_VIDEO_FR" 
                          title="Présentation en français"
                          frameborder="0" 
                          allowfullscreen="true">
                  </iframe>
                </xsl:when>
                <xsl:when test="$langue='en-GB'">
                  <iframe width="560" height="315" 
                          src="https://www.youtube.com/embed/VOTRE_VIDEO_EN" 
                          title="English presentation"
                          frameborder="0" 
                          allowfullscreen="true">
                  </iframe>
                </xsl:when>
                <xsl:when test="$langue='zh-CN'">
                  <iframe width="560" height="315" 
                          src="https://www.youtube.com/embed/VOTRE_VIDEO_ZH" 
                          title="中文介绍"
                          frameborder="0" 
                          allowfullscreen="true">
                  </iframe>
                </xsl:when>
              </xsl:choose>
              
              <p style="margin-top: 15px; text-align: center; color: #7f8c8d; font-size: 14px;">
                <xsl:choose>
                  <xsl:when test="$langue='fr-FR'">
                    Une présentation personnelle pour mieux me connaître
                  </xsl:when>
                  <xsl:when test="$langue='en-GB'">
                    A personal presentation to get to know me better
                  </xsl:when>
                  <xsl:when test="$langue='zh-CN'">
                    个人介绍视频，让您更好地了解我
                  </xsl:when>
                </xsl:choose>
              </p>
            </div>
          </div>
          
        </div>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>