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
     * Sauvegarde la position actuelle de scroll et l'ancre avec précision
     */
    sauvegarderPosition() {
        // Position de scroll précise
        this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        this.currentAnchor = window.location.hash;
        
        // Identifier l'élément visible le plus proche pour ancrage intelligent
        const visibleElement = this.trouverElementVisible();
        
        // Sauvegarder toutes les informations de position
        const positionData = {
            scrollTop: this.scrollPosition,
            anchor: this.currentAnchor,
            visibleElement: visibleElement,
            timestamp: Date.now(),
            viewportHeight: window.innerHeight,
            documentHeight: document.documentElement.scrollHeight
        };
        
        sessionStorage.setItem('cv_position_data', JSON.stringify(positionData));
        
        console.log('📍 Position sauvegardée complète:', positionData);
    }

    /**
     * Trouve l'élément le plus visible à l'écran pour un ancrage intelligent
     */
    trouverElementVisible() {
        const sections = document.querySelectorAll('.section');
        const viewportTop = window.pageYOffset;
        const viewportBottom = viewportTop + window.innerHeight;
        const viewportMiddle = viewportTop + (window.innerHeight / 2);
        
        let bestMatch = null;
        let bestDistance = Infinity;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const elementTop = rect.top + viewportTop;
            const elementBottom = elementTop + rect.height;
            
            // L'élément est-il visible ?
            if (elementBottom > viewportTop && elementTop < viewportBottom) {
                // Distance au milieu de la viewport
                const distance = Math.abs(elementTop - viewportMiddle);
                
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = {
                        id: section.id || this.genererIdSection(section),
                        offsetFromTop: viewportTop - elementTop,
                        title: section.querySelector('.section-title')?.textContent || 'Section',
                        className: section.className
                    };
                }
            }
        });
        
        return bestMatch;
    }

    /**
     * Génère un ID pour une section qui n'en a pas
     */
    genererIdSection(section) {
        const title = section.querySelector('.section-title');
        if (title) {
            const id = title.textContent
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            section.id = id;
            return id;
        }
        return `section-${Date.now()}`;
    }

    /**
     * Restaure la position de scroll avec ancrage intelligent
     */
    restaurerPosition() {
        const savedData = sessionStorage.getItem('cv_position_data');
        if (!savedData) return;
        
        try {
            const positionData = JSON.parse(savedData);
            console.log('🔄 Restauration de la position:', positionData);
            
            // Nettoyer immédiatement pour éviter les restaurations multiples
            sessionStorage.removeItem('cv_position_data');
            
            // Attendre que le DOM soit complètement chargé
            setTimeout(() => {
                this.restaurerPositionAvecMethodes(positionData);
            }, 100);
            
        } catch (error) {
            console.warn('⚠️ Erreur restauration position:', error);
            sessionStorage.removeItem('cv_position_data');
        }
    }

    /**
     * Restaure la position avec différentes méthodes selon la situation
     */
    restaurerPositionAvecMethodes(positionData) {
        let positionRestauree = false;
        
        // Méthode 1: Ancre URL spécifique
        if (positionData.anchor && positionData.anchor !== '') {
            const element = document.querySelector(positionData.anchor);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                console.log('✅ Position restaurée via ancre URL:', positionData.anchor);
                positionRestauree = true;
            }
        }
        
        // Méthode 2: Élément visible identifié
        if (!positionRestauree && positionData.visibleElement) {
            const element = document.getElementById(positionData.visibleElement.id);
            if (element) {
                const elementTop = element.offsetTop;
                const scrollTarget = elementTop - positionData.visibleElement.offsetFromTop;
                
                window.scrollTo({
                    top: Math.max(0, scrollTarget),
                    behavior: 'smooth'
                });
                
                console.log('✅ Position restaurée via élément visible:', positionData.visibleElement.title);
                positionRestauree = true;
            }
        }
        
        // Méthode 3: Position de scroll exacte (fallback)
        if (!positionRestauree && positionData.scrollTop > 0) {
            // Ajuster pour les différences de hauteur de document
            const ratioHauteur = document.documentElement.scrollHeight / positionData.documentHeight;
            const scrollAjuste = positionData.scrollTop * ratioHauteur;
            
            window.scrollTo({
                top: scrollAjuste,
                behavior: 'smooth'
            });
            
            console.log('✅ Position restaurée via scroll exact:', scrollAjuste);
            positionRestauree = true;
        }
        
        // Méthode 4: Pas de restauration nécessaire
        if (!positionRestauree) {
            console.log('ℹ️ Aucune position à restaurer (haut de page)');
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
     * Change la langue via GET (PRIORITÉ 1) - Navigation fluide améliorée
     */
    changerLangueGet(nouvelleLangue) {
        if (!this.languesDisponibles.includes(nouvelleLangue)) return;
        
        console.log('🔗 Changement de langue via GET:', nouvelleLangue);
        
        // Si on est sur la même langue, ne rien faire
        if (nouvelleLangue === this.langueActuelle) {
            console.log('ℹ️ Même langue, pas de changement nécessaire');
            return;
        }
        
        // Sauvegarder position actuelle avec précision
        this.sauvegarderPosition();
        
        // Animation de transition douce
        document.body.style.transition = 'opacity 0.2s ease';
        document.body.style.opacity = '0.8';
        
        // Utiliser XSLT pour transformation à la volée
        setTimeout(() => {
            this.chargerCV(nouvelleLangue);
        }, 100);
    }

    /**
     * Charge le CV avec transformation XSLT - VERSION NAVIGATION FLUIDE
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
            
            // Remplacer le contenu avec préservation du scroll
            const shouldRestorePosition = nouvelleLangue !== null;
            
            // Masquer l'écran de chargement s'il existe encore
            this.masquerChargement();
            
            // Remplacer le contenu
            document.open();
            document.write(newHtml);
            document.close();
            
            // Mettre à jour la langue actuelle
            this.langueActuelle = langue;
            this.sauvegarderLangue(langue);
            
            // Ajouter les ancres pour navigation interne
            this.ajouterAncres();
            
            // Réattacher les événements
            this.attacherEvenements();
            
            // Restaurer la position si c'est un changement de langue
            if (shouldRestorePosition) {
                // Restaurer la position après que le DOM soit stabilisé
                setTimeout(() => {
                    this.restaurerPosition();
                }, 50);
            }
            
            // Restaurer l'opacité
            setTimeout(() => {
                document.body.style.transition = 'opacity 0.3s ease';
                document.body.style.opacity = '1';
            }, shouldRestorePosition ? 200 : 100);
            
            // Gérer les vidéos multilingues
            this.gererVideoMultilingue();
            
        } catch (error) {
            console.error('❌ Erreur transformation XSLT:', error);
            this.afficherErreur();
        }
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
     * Attache les événements - VERSION NAVIGATION FLUIDE
     */
    attacherEvenements() {
        setTimeout(() => {
            // Événements pour liens de langue avec animation fluide
            const boutons = document.querySelectorAll('.lang-button');
            boutons.forEach(bouton => {
                bouton.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Désactiver temporairement tous les boutons pour éviter les clics multiples
                    boutons.forEach(b => b.style.pointerEvents = 'none');
                    setTimeout(() => {
                        const newButtons = document.querySelectorAll('.lang-button');
                        newButtons.forEach(b => b.style.pointerEvents = 'auto');
                    }, 1000);
                    
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

            // Gestion intelligente du scroll pour sauvegarder la position
            let scrollTimeout;
            let lastScrollPosition = 0;
            
            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                
                // Throttling pour performance
                scrollTimeout = setTimeout(() => {
                    const currentScroll = window.pageYOffset;
                    
                    // Ne sauvegarder que si le scroll a significativement changé
                    if (Math.abs(currentScroll - lastScrollPosition) > 10) {
                        this.scrollPosition = currentScroll;
                        lastScrollPosition = currentScroll;
                        
                        // Sauvegarder périodiquement la position (pas à chaque scroll)
                        clearTimeout(this.savePositionTimeout);
                        this.savePositionTimeout = setTimeout(() => {
                            const quickSave = {
                                scrollTop: this.scrollPosition,
                                timestamp: Date.now()
                            };
                            sessionStorage.setItem('cv_quick_position', JSON.stringify(quickSave));
                        }, 500);
                    }
                }, 16); // ~60fps
            });

            // Gestion des ancres avec historique
            window.addEventListener('hashchange', () => {
                this.currentAnchor = window.location.hash;
                console.log('🔗 Ancre changée:', this.currentAnchor);
            });

            // Gestion des touches clavier pour navigation
            document.addEventListener('keydown', (e) => {
                // Navigation par langues avec Alt+1,2,3
                if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                    switch(e.key) {
                        case '1':
                            e.preventDefault();
                            this.changerLangueGet('fr-FR');
                            break;
                        case '2':
                            e.preventDefault();
                            this.changerLangueGet('en-GB');
                            break;
                        case '3':
                            e.preventDefault();
                            this.changerLangueGet('zh-CN');
                            break;
                    }
                }
            });

            // Ajouter navigation par sections améliorée
            this.ajouterNavigationSections();
            
            // Gérer les vidéos multilingues
            this.gererVideoMultilingue();
            
            // Indicateur visuel de langue active
            this.mettreAJourIndicateurLangue();
            
            // Afficher debug si demandé
            if (window.location.search.includes('debug=1')) {
                this.afficherDebugInfo();
            }
            
        }, 100);
    }

    /**
     * Met à jour l'indicateur visuel de la langue active
     */
    mettreAJourIndicateurLangue() {
        const boutons = document.querySelectorAll('.lang-button');
        boutons.forEach(bouton => {
            bouton.classList.remove('active');
            
            const href = bouton.getAttribute('href');
            let langueCorrespondante = '';
            
            if (href.includes('cv_fr.html') && this.langueActuelle === 'fr-FR') {
                langueCorrespondante = 'fr-FR';
            } else if (href.includes('cv_en.html') && this.langueActuelle === 'en-GB') {
                langueCorrespondante = 'en-GB';
            } else if (href.includes('cv_zh.html') && this.langueActuelle === 'zh-CN') {
                langueCorrespondante = 'zh-CN';
            }
            
            if (langueCorrespondante === this.langueActuelle) {
                bouton.classList.add('active');
            }
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