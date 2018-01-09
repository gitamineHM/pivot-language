const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = 'http://localhost:3000'
chai.use(chaiHttp);

  describe('/POST translate', () => {
      it('it should translate fr to ko', (done) => {
        chai.request(server)
            .post('/translate')
            .send({ source : 'auto', target : 'ko' , input : 'ceci est un test' })
            .end((err, res) => {
                res.should.have.status(200);
                // res.body.should.be.a('array');
               res.body.outputs[0].output.should.equal('이것은 테스트입니다')
              done();
            });
      });
  });

  describe('/POST translate', () => {
      it('it should translate es to ja', (done) => {
        chai.request(server)
            .post('/translate')
            .send({ source : 'auto', target : 'ja' , input : 'gracias de traducirme esto' })
            .end((err, res) => {
               res.should.have.status(200);
               res.body.outputs[0].output.should.equal('私にこれを翻訳するありがとう')
              done();
            });
      });
  });
