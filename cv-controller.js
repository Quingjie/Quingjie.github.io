/**
 * Contrôleur JavaScript pour CV multilingue - VERSION AMÉLIORÉE
 * Avec gestion fluide de la navigation et position de scroll
 */

class CVMultilingueComplete {
    constructor() {
        this.languesDisponibles = ['fr-FR', 'en-GB', 'zh-CN'];
        this.langueParDefaut = 'fr-FR';
        this.langueActuelle = this.determinerLangue();
        this.scrollPosition = 0;
        this.currentAnchor = '';
        this.init();
    }

    /**
     * PRIORITÉS EXACTES DU TP :
     * 1. Paramètre GET (?lang=en)
     * 2. Paramètre POST (formulaire soumis)
     * 3. Variable de session (localStorage)
     * 4. Accept-Language navigateur
     * 5. Langue par défaut
     */
    determinerLangue() {
        console.log('🔍 Détermination de la langue...');

        // 1. PRIORITÉ 1 : Paramètre GET
        const urlParams = new URLSearchParams(window.location.search);
        const langueGet = urlParams.get('lang');
        if (langueGet && this.languesDisponibles.includes(langueGet)) {
            console.log('✅ Langue trouvée via GET:', langueGet);
            this.sauvegarderLangue(langueGet);
            return langueGet;
        }

        // 2. PRIORITÉ 2 : Paramètre POST (simulé avec sessionStorage temporaire)
        const languePost = sessionStorage.getItem('cv_langue_post');
        if (languePost && this.languesDisponibles.includes(languePost)) {
            console.log('✅ Langue trouvée via POST:', languePost);
            sessionStorage.removeItem('cv_langue_post');
            this.sauvegarderLangue(languePost);
            return languePost;
        }

        // 3. PRIORITÉ 3 : Variable de session (localStorage)
        const langueSauvegardee = localStorage.getItem('cv_langue');
        if (langueSauvegardee && this.languesDisponibles.includes(langueSauvegardee)) {
            console.log('✅ Langue trouvée via session localStorage:', langueSauvegardee);
            return langueSauvegardee;
        }

        // 4. PRIORITÉ 4 : Accept-Language du navigateur
        const langueNavigateur = this.detecterLangueNavigateur();
        if (langueNavigateur) {
            console.log('✅ Langue trouvée via navigateur:', langueNavigateur);
            this.sauvegarderLangue(langueNavigateur);
            return langueNavigateur;
        }

        // 5. PRIORITÉ 5 : Langue par défaut
        console.log('✅ Langue par défaut utilisée:', this.langueParDefaut);
        this.sauvegarderLangue(this.langueParDefaut);
        return this.langueParDefaut;
    }

    /**
     * Détecte la langue du navigateur selon Accept-Language
     */
    detecterLangueNavigateur() {
        console.log('🌐 Vérification Accept-Language...');
        const langues = navigator.languages || [navigator.language || navigator.userLanguage];
        console.log('Langues du navigateur:', langues);
        
        for (const langue of langues) {
            if (this.languesDisponibles.includes(langue)) {
                return langue;
            }
            
            const langueBase = langue.split('-')[0];
            for (const langueDisp of this.languesDisponibles) {
                if (langueDisp.startsWith(langueBase + '-')) {
                    return langueDisp;
                }
            }
        }
        
        return null;
    }

    /**
     * Sauvegarde la langue et la position de navigation
     */
    sauvegarderLangue(langue) {
        localStorage.setItem('cv_langue', langue);
        console.log('💾 Langue sauvegardée:', langue);
    }

    /**
     * Sauvegarde la position actuelle de scroll et l'ancre
     */
    sauvegarderPosition() {
        this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        this.currentAnchor = window.location.hash;
        
        // Sauvegarder aussi dans sessionStorage pour persistance
        sessionStorage.setItem('cv_scroll_position', this.scrollPosition.toString());
        sessionStorage.setItem('cv_current_anchor', this.currentAnchor);
        
        console.log('📍 Position sauvegardée:', this.scrollPosition, this.currentAnchor);
    }

    /**
     * Restaure la position de scroll après changement de langue
     */
    restaurerPosition() {
        const savedScroll = sessionStorage.getItem('cv_scroll_position');
        const savedAnchor = sessionStorage.getItem('cv_current_anchor');
        
        if (savedAnchor) {
            // Attendre que le DOM soit chargé puis aller à l'ancre
            setTimeout(() => {
                const element = document.querySelector(savedAnchor);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    // Nettoyer après utilisation
                    sessionStorage.removeItem('cv_current_anchor');
                    sessionStorage.removeItem('cv_scroll_position');
                    return;
                }
            }, 300);
        }
        
        if (savedScroll) {
            setTimeout(() => {
                window.scrollTo({
                    top: parseInt(savedScroll),
                    behavior: 'smooth'
                });
                sessionStorage.removeItem('cv_scroll_position');
            }, 300);
        }
    }

    /**
     * Change la langue via formulaire POST (PRIORITÉ 2)
     */
    changerLanguePost(nouvelleLangue) {
        if (!this.languesDisponibles.includes(nouvelleLangue)) return;
        
        console.log('📝 Changement de langue via POST:', nouvelleLangue);
        
        // Sauvegarder position actuelle
        this.sauvegarderPosition();
        
        // Simuler POST avec sessionStorage temporaire
        sessionStorage.setItem('cv_langue_post', nouvelleLangue);
        
        // Recharger la page pour déclencher la nouvelle détection
        window.location.href = window.location.pathname + window.location.search;
    }

    /**
     * Change la langue via GET (PRIORITÉ 1) - Navigation fluide
     */
    changerLangueGet(nouvelleLangue) {
        if (!this.languesDisponibles.includes(nouvelleLangue)) return;
        
        console.log('🔗 Changement de langue via GET:', nouvelleLangue);
        
        // Sauvegarder position actuelle
        this.sauvegarderPosition();
        
        // Si on est sur la même langue, ne rien faire
        if (nouvelleLangue === this.langueActuelle) {
            return;
        }
        
        // Utiliser XSLT pour transformation à la volée
        this.chargerCV(nouvelleLangue);
    }

    /**
     * Charge le CV avec transformation XSLT - VERSION AMÉLIORÉE
     */
    async chargerCV(nouvelleLangue = null) {
        const langue = nouvelleLangue || this.langueActuelle;
        console.log('📄 Chargement du CV en langue:', langue);
        
        try {
            // Charger XML et XSLT
            const [xmlResponse, xslResponse] = await Promise.all([
                fetch('cv.xml'),
                fetch('cv.xsl')
            ]);

            const xmlText = await xmlResponse.text();
            const xslText = await xslResponse.text();
            
            const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
            const xslDoc = new DOMParser().parseFromString(xslText, 'text/xml');

            // Transformation XSLT avec paramètre de langue
            const xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(xslDoc);
            xsltProcessor.setParameter(null, 'langue', langue);

            const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
            const newHtml = new XMLSerializer().serializeToString(resultDoc);
            
            // Animation de transition
            if (nouvelleLangue) {
                document.body.style.opacity = '0.7';
                document.body.style.transition = 'opacity 0.2s ease';
            }
            
            // Remplacer le contenu
            document.open();
            document.write(newHtml);
            document.close();
            
            // Masquer l'écran de chargement une fois le CV affiché
            const loadingElement = document.querySelector('.loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }

            // Afficher le contenu principal avec une transition
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.transition = 'opacity 0.3s ease';
                document.body.style.opacity = '1';
            }, 100);

            // Mettre à jour la langue actuelle
            this.langueActuelle = langue;
            this.sauvegarderLangue(langue);
            
            // Réattacher les événements
            this.attacherEvenements();
            
            // Restaurer la position si c'est un changement de langue
            if (nouvelleLangue) {
                this.restaurerPosition();
                
                // Restaurer l'opacité
                setTimeout(() => {
                    document.body.style.opacity = '1';
                }, 100);
            }
            
            // Ajouter les ancres pour navigation interne
            this.ajouterAncres();
            
        } catch (error) {
            console.error('❌ Erreur transformation XSLT:', error);
            this.afficherErreur();
        }

        this.masquerChargement();
    }

    /**
     * Ajoute des ancres pour la navigation interne
     */
    ajouterAncres() {
        const sections = document.querySelectorAll('.section');
        sections.forEach((section, index) => {
            const title = section.querySelector('.section-title');
            if (title && !section.id) {
                // Créer un ID basé sur le titre
                const id = title.textContent
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                section.id = id;
            }
        });
    }

    /**
     * Ajoute la navigation par sections
     */
    ajouterNavigationSections() {
        const nav = document.createElement('nav');
        nav.className = 'section-nav';
        nav.style.cssText = `
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255,255,255,0.9);
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 999;
        `;
        
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            const title = section.querySelector('.section-title');
            if (title && section.id) {
                const link = document.createElement('a');
                link.href = `#${section.id}`;
                link.textContent = '•';
                link.style.cssText = `
                    display: block;
                    margin: 5px 0;
                    color: #3498db;
                    text-decoration: none;
                    font-size: 20px;
                    line-height: 1;
                `;
                link.title = title.textContent;
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    section.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState(null, null, `#${section.id}`);
                });
                
                nav.appendChild(link);
            }
        });
        
        document.body.appendChild(nav);
    }

    /**
     * Gestion des vidéos multilingues
     */
    gererVideoMultilingue() {
        const videoContainer = document.querySelector('.video-container');
        if (!videoContainer) return;
        
        const videos = {
            'fr-FR': 'https://youtube.com/embed/VIDEO_FR',
            'en-GB': 'https://youtube.com/embed/VIDEO_EN', 
            'zh-CN': 'https://youtube.com/embed/VIDEO_ZH'
        };
        
        const currentVideo = videos[this.langueActuelle];
        if (currentVideo) {
            videoContainer.innerHTML = `
                <iframe width="560" height="315" 
                    src="${currentVideo}" 
                    title="Portfolio Video" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>
            `;
        }
    }

    /**
     * Attache les événements - VERSION AMÉLIORÉE
     */
    attacherEvenements() {
        setTimeout(() => {
            // Événements pour liens de langue
            const boutons = document.querySelectorAll('.lang-button');
            boutons.forEach(bouton => {
                bouton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const href = bouton.getAttribute('href');
                    
                    if (href.includes('cv_fr.html')) {
                        this.changerLangueGet('fr-FR');
                    } else if (href.includes('cv_en.html')) {
                        this.changerLangueGet('en-GB');
                    } else if (href.includes('cv_zh.html')) {
                        this.changerLangueGet('zh-CN');
                    }
                });
            });

            // Gestion du scroll pour sauvegarder la position
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    this.scrollPosition = window.pageYOffset;
                }, 100);
            });

            // Gestion des ancres
            window.addEventListener('hashchange', () => {
                this.currentAnchor = window.location.hash;
            });

            // Ajouter navigation par sections
            this.ajouterNavigationSections();
            
            // Gérer les vidéos multilingues
            this.gererVideoMultilingue();
            
            // Afficher debug si demandé
            if (window.location.search.includes('debug=1')) {
                this.afficherDebugInfo();
            }
            
        }, 100);

        // Fonction pour gérer le changement de langue avec animation
        const gererChangementLangue = (nouvelleLangue) => {
            // Animation de sortie
            document.body.classList.add('changing-language');
            
            // Changer la langue après l'animation
            setTimeout(() => {
                this.changerLangueGet(nouvelleLangue);
            }, 150);
        };

        // Modifier les event listeners des boutons de langue :
        boutons.forEach(bouton => {
            bouton.addEventListener('click', (e) => {
                e.preventDefault();
                const href = bouton.getAttribute('href');
                
                if (href.includes('cv_fr.html')) {
                    gererChangementLangue('fr-FR');
                } else if (href.includes('cv_en.html')) {
                    gererChangementLangue('en-GB');
                } else if (href.includes('cv_zh.html')) {
                    gererChangementLangue('zh-CN');
                }
            });
        });
    }

    /**
     * Affiche les informations de debug
     */
    afficherDebugInfo() {
        const info = {
            'Langue actuelle': this.langueActuelle,
            'Langue localStorage': localStorage.getItem('cv_langue'),
            'Langue sessionStorage POST': sessionStorage.getItem('cv_langue_post'),
            'URL params': Object.fromEntries(new URLSearchParams(window.location.search)),
            'Navigator languages': navigator.languages,
            'Position scroll': this.scrollPosition,
            'Ancre actuelle': this.currentAnchor
        };
        
        console.table(info);
        
        const debugDiv = document.createElement('div');
        debugDiv.style.cssText = `
            position: fixed; bottom: 10px; left: 10px; 
            background: #333; color: white; padding: 10px; 
            border-radius: 5px; font-size: 12px; z-index: 9999;
            max-width: 300px; opacity: 0.9;
        `;
        debugDiv.innerHTML = `
            <strong>🐛 Debug CV Multilingue</strong><br/>
            Langue: <code>${this.langueActuelle}</code><br/>
            localStorage: <code>${localStorage.getItem('cv_langue') || 'null'}</code><br/>
            URL ?lang=: <code>${new URLSearchParams(window.location.search).get('lang') || 'null'}</code><br/>
            Scroll: <code>${this.scrollPosition}px</code><br/>
            Ancre: <code>${this.currentAnchor || 'aucune'}</code>
        `;
        document.body.appendChild(debugDiv);
        
        setTimeout(() => debugDiv.remove(), 8000);
    }

    afficherErreur() {
        document.body.innerHTML = `
            <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
                <h1 style="color: #e74c3c;">❌ Erreur de chargement</h1>
                <p>Impossible de charger le CV multilingue.</p>
                <p><strong>Langue sélectionnée:</strong> ${this.langueActuelle}</p>
                <p><strong>Fichiers requis:</strong> cv.xml, cv.xsl</p>
                <button onclick="location.reload()" style="
                    padding: 10px 20px; 
                    background: #3498db; 
                    color: white; 
                    border: none; 
                    border-radius: 5px; 
                    cursor: pointer;
                    margin-top: 20px;
                ">🔄 Recharger</button>
            </div>
        `;
    }

    async init() {
        console.log('🚀 Initialisation CV Multilingue Complete');
        await this.chargerCV();
        
        // Restaurer la position si on revient d'un changement de langue
        this.restaurerPosition();
    }

    //Cache l'écran de chargement et affiche le CV
    masquerChargement() {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.style.transition = 'opacity 0.3s ease';
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 300);
        }
    }
}

// Démarrage automatique
let cvController;
document.addEventListener('DOMContentLoaded', () => {
    cvController = new CVMultilingueComplete();
});

// Fonctions globales pour tests et débogage
window.cvController = cvController;

window.testLanguePriorites = () => {
    console.log('🧪 Test des priorités de langue');
    
    // Test 1: Nettoyer tout
    localStorage.removeItem('cv_langue');
    sessionStorage.removeItem('cv_langue_post');
    console.log('1. Tout nettoyé - devrait utiliser navigateur ou défaut');
    
    // Test 2: Définir localStorage
    localStorage.setItem('cv_langue', 'en-GB');
    console.log('2. localStorage défini sur en-GB');
    
    // Test 3: Définir POST (priorité plus haute)
    sessionStorage.setItem('cv_langue_post', 'zh-CN');
    console.log('3. POST défini sur zh-CN (devrait prendre le dessus)');
    
    // Test 4: Recharger pour voir l'effet
    console.log('4. Rechargez la page pour voir le résultat');
};

window.testNavigationFluide = () => {
    console.log('🧪 Test navigation fluide');
    
    // Scroller vers le bas
    window.scrollTo(0, 500);
    console.log('1. Scrollé vers 500px');
    
    // Attendre puis changer de langue
    setTimeout(() => {
        cvController.changerLangueGet('en-GB');
        console.log('2. Changement vers anglais, position devrait être conservée');
    }, 1000);
};

window.allerVersSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, null, `#${sectionId}`);
    }
};