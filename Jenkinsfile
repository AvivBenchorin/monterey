pipeline {
  agent {
    // this image provides everything needed to run Cypress
    docker {
      image 'cypress/base:10'
    }
  }
  environment {
    HOME = '.'
  }

  stages {
    stage('build and test') {
      steps {
        sh 'npm ci'
        sh "npm run e2e:headless:parallel"
      }
    }
  }
}