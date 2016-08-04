require([
            'dojo/aspect',
            'dojo/_base/declare',
            'dojo/_base/array',
            'JBrowse/Browser',
            'JBrowse/Store/SeqFeature/BAM',
            'JBrowse/Model/XHRBlob',
            'JBrowse/Store/SeqFeature/_MismatchesMixin',
            'JBrowse/View/Track/_AlignmentsMixin',
            'JBrowse/Model/SimpleFeature'
        ], function( aspect, declare, array, Browser, BAMStore, XHRBlob, MismatchesMixin, AlignmentsMixin, SimpleFeature ) {

// function distinctBins( features ) {
//     var bins = {};
//     features.forEach( function(f) {
//         bins[ f.data._bin ] = ( bins[ f.data._bin ] || 0 ) + 1;
//     });
//     return bins;
// }


describe( 'BAM mismatches test', function() {
              var feature=new SimpleFeature({data: {
                start: 7903922,
                length: 90,
                cigar: "89M2741N1M",
                md: "89A0",
                seq: "TACTTGATAAATCAGCTCACTCTCTGGTGCTTTTTAGAGAAGTCCCTGATTCCTTCTTAAACTTGGAATGATAGATGAAATTCACACCCG"
              }});

              //Config workaround since we aren't directly instantiating anything with Browser/config
              var Config=declare(null, {
                  constructor: function() {
                      this.config={};
                  }
              });
              //Use Config workaround
              var MismatchParser=declare([Config,MismatchesMixin]);


              it('getMismatches test', function() {
                  var parser = new MismatchParser();
                  var obj = parser._getMismatches(feature);
                  expect(obj[1].base).toEqual("G");
                  expect(obj[1].length).toEqual(1);
                  expect(obj[1].start).toEqual(2830)
                  expect(obj[1].type).toEqual("mismatch");
              });
});

describe( 'BAM with volvox-sorted.bam', function() {
              var b;
              beforeEach( function() {
                  b = new BAMStore({
                                       browser: new Browser({ unitTestMode: true }),
                                       bam: new XHRBlob('../../sample_data/raw/volvox/volvox-sorted.bam'),
                                       bai: new XHRBlob('../../sample_data/raw/volvox/volvox-sorted.bam.bai'),
                                       refSeq: { name: 'ctgA', start: 1, end: 500001 }
                                   });
              });

              it( 'constructs', function() {
                      expect(b).toBeTruthy();
                  });

              it( 'loads some data', function() {
                      var loaded;
                      var features = [];
                      var done;
                      aspect.after( b, 'loadSuccess', function() {
                          loaded = true;
                      });
                      b.getFeatures({ start: 0, end: 50000 },
                                 function( feature ) {
                                     features.push( feature );
                                 },
                                 function() {
                                     done = true;
                                 }
                               );
                      waitsFor( function() { return done; }, 2000 );
                      runs( function() {
                                expect(features.length).toBeGreaterThan(1000);
                            });
                  });

});

describe( 'BAM with test_deletion_2_0.snps.bwa_align.sorted.grouped.bam', function() {
              var b;
              beforeEach( function() {
                  b = new BAMStore({
                      browser: new Browser({ unitTestMode: true }),
                      bam: new XHRBlob('../data/test_deletion_2_0.snps.bwa_align.sorted.grouped.bam'),
                      bai: new XHRBlob('../data/test_deletion_2_0.snps.bwa_align.sorted.grouped.bam.bai'),
                      refSeq: { name: 'Chromosome', start: 1, end: 20000 }
                  });
              });

              it( 'constructs', function() {
                      expect(b).toBeTruthy();
                  });

              it( 'loads some data', function() {
                      var loaded;
                      var features = [];
                      var done;
                      aspect.after( b, 'loadSuccess', function() {
                          loaded = true;
                      });
                      b.getFeatures({ start: 17000, end: 18000 },
                                 function( feature ) {
                                     features.push( feature );
                                 },
                                 function() {
                                     done = true;
                                 }
                               );
                      waitsFor( function() { return done; }, 2000 );
                      runs( function() {
                                expect(features.length).toEqual(124);
                                //console.log( distinctBins(features) );
                            });
                  });

              it( 'check that seqlength == seq.length', function() {
                      var loaded;
                      var features = [];
                      var done;
                      aspect.after( b, 'loadSuccess', function() {
                          loaded = true;
                      });
                      b.getFeatures({ start: 17000, end: 18000 },
                                 function( feature ) {
                                     features.push( feature );
                                 },
                                 function() {
                                     done = true;
                                 }
                               );
                      waitsFor( function() { return done; }, 2000 );
                      runs( function() {
                                expect(array.every(features,function(feature) { return feature.get('seq_length')== feature.get('seq').length; })).toBeTruthy();
                            });
                  });

});

describe( 'empty BAM', function() {
              var b;
              beforeEach( function() {
                  b = new BAMStore({
                      browser: new Browser({ unitTestMode: true }),
                      bam: new XHRBlob('../data/empty.bam'),
                      bai: new XHRBlob('../data/empty.bam.bai'),
                      refSeq: { name: 'Chromosome', start: 1, end: 20000 }
                  });
              });

              it( 'constructs', function() {
                      expect(b).toBeTruthy();
                  });

              it( "returns no data, but doesn't crash", function() {
                      var loaded;
                      var features = [];
                      var done;
                      aspect.after( b, 'loadSuccess', function() {
                          loaded = true;
                      });
                      b.getFeatures( { start: 0, end: 50000 },
                                 function( feature ) {
                                     features.push( feature );
                                 },
                                 function() {
                                     done = true;
                                 }
                               );
                      waitsFor( function() { return done; }, 2000 );
                      runs( function() {
                                expect(features.length).toEqual( 0 );
                            });
                  });
});

describe( 'BAM with B tags', function() {
              var b;
              beforeEach( function() {
                  b = new BAMStore({
                      browser: new Browser({ unitTestMode: true }),
                      bam: new XHRBlob('../data/Btag.bam'),
                      bai: new XHRBlob('../data/Btag.bam.bai'),
                      refSeq: { end: 1000000,
                                length: 1000000,
                                name: "chr1",
                                seqChunkSize: 80000,
                                start: 0
                              }
                  });
              });

              it( 'constructs', function() {
                      expect(b).toBeTruthy();
                  });

              it( 'loads some data', function() {
                      var loaded;
                      var features = [];
                      var done;
                      aspect.after( b, 'loadSuccess', function() {
                          loaded = true;
                      });
                      b.getFeatures({ start: 980654, end: 981663 },
                                 function( feature ) {
                                     features.push( feature );
                                 },
                                 function() {
                                     done = true;
                                 }
                               );
                      waitsFor( function() { return done; }, 2000 );
                      runs( function() {
                                //ZC:B:i,364,359,1,0	ZD:B:f,0.01,0.02,0.03	ZE:B:c,0,1,2,3	ZK:B:s,45,46,47
                                var ret = features[1].get('ZD').split(",");
                                expect(features[1].get('ZC')).toEqual("364,359,1,0");
                                expect(features[1].get('ZE')).toEqual("0,1,2,3");
                                expect(features[1].get('ZK')).toEqual("45,46,47");
                                expect(Math.abs(+ret[0]-0.01)<Number.EPSILON);
                                expect(Math.abs(+ret[1]-0.02)<Number.EPSILON);
                                expect(Math.abs(+ret[2]-0.03)<Number.EPSILON);
                                expect(features.length).toEqual(2);
                                //console.log( distinctBins(features) );
                            });
                  });
});
describe( 'BAM with tests/data/final.merged.sorted.rgid.mkdup.realign.recal.bam', function() {
              var b;
              beforeEach( function() {
                  b = new BAMStore({
                      browser: new Browser({ unitTestMode: true }),
                      bam: new XHRBlob('../data/final.merged.sorted.rgid.mkdup.realign.recal.bam'),
                      bai: new XHRBlob('../data/final.merged.sorted.rgid.mkdup.realign.recal.bam.bai'),
                      refSeq: { end: 27682,
                                length: 27682,
                                name: "chr21_gl000210_random",
                                seqChunkSize: 80000,
                                start: 0
                              }
                  });
              });

              it( 'constructs', function() {
                      expect(b).toBeTruthy();
                  });

              it( 'loads some data', function() {
                      var loaded;
                      var features = [];
                      var done;
                      aspect.after( b, 'loadSuccess', function() {
                          loaded = true;
                      });
                      b.getFeatures({ start: 16589, end: 18964 },
                                 function( feature ) {
                                     features.push( feature );
                                 },
                                 function() {
                                     done = true;
                                 }
                               );
                      waitsFor( function() { return done; }, 2000 );
                      runs( function() {
                                expect(features.length).toEqual(281);
                                //console.log( distinctBins(features) );
                            });
                  });
});


describe( 'BAM mismatch test', function() {
              var b;
              //Config workaround since we aren't directly instantiating anything with Browser/config
              var Config=declare(null, {
                  constructor: function() {
                      this.config={};
                  }
              });
              //Use Config workaround
              var MismatchParser = declare([Config, MismatchesMixin]);
              //Use Config workaround
              var AlignmentParser = declare([Config, AlignmentsMixin]);


              it('resultTable test', function() {
                  var parser = new AlignmentParser();
                  var elt = dojo.create('div');
                  var res = parser._renderTable(elt, new MismatchParser(), new SimpleFeature({data: {id: "read162/ctgA:g2.t1", seq: "TACACAAGCACCGGGCGCGCGAGACACGATTGAATCCTTCAAACAGGGTTACTCGTTCGTGACAACCGATTACAGCATTCTTAACGTGGTACGTGCACAT", md: "77G18", cigar: "4S22M50N74M"}}));
                  expect(res.val1).toEqual("TACACAAGCACCGGGCGCGCGAGACA...GATTGAATCCTTCAAACAGGGTTACTCGTTCGTGACAACCGATTACAGCATTCTTAACGTGGTACGTGCACAT");
                  expect(res.val2).toEqual("....||||||||||||||||||||||...|||||||||||||||||||||||||||||||||||||||||||||||||||||| ||||||||||||||||||");
                  expect(res.val3).toEqual("SSSSCAAGCACCGGGCGCGCGAGACA...GATTGAATCCTTCAAACAGGGTTACTCGTTCGTGACAACCGATTACAGCATTCTGAACGTGGTACGTGCACAT");
              });
              it('resultTable test insertion', function() {
                  var parser = new AlignmentParser();
                  var elt = dojo.create('div');
                  var res = parser._renderTable(elt, new MismatchParser(), new SimpleFeature({data: {id: "ctgA_15155_15557_3:0:1_0:0:0_1dde", seq: "TTTAGTGGGACCCAATCGCAACCCTGCTCCCCTCCCTTACGCCTTATACACTTCAGTGTAAATTCATGCGTTCAGCGAACAACTGGACTTCTGTTGTACG", md: "11A45C41", cigar: "9M1I90M"}}));
                  expect(res.val1).toEqual("TTTAGTGGGACCCAATCGCAACCCTGCTCCCCTCCCTTACGCCTTATACACTTCAGTGTAAATTCATGCGTTCAGCGAACAACTGGACTTCTGTTGTACG");
                  expect(res.val2).toEqual("||||||||| || ||||||||||||||||||||||||||||||||||||||||||||| |||||||||||||||||||||||||||||||||||||||||");
                  expect(res.val3).toEqual("TTTAGTGGG-CCAAATCGCAACCCTGCTCCCCTCCCTTACGCCTTATACACTTCAGTGCAAATTCATGCGTTCAGCGAACAACTGGACTTCTGTTGTACG");
              });

              it('resultTable test large deletion', function() {
                  var parser = new AlignmentParser();
                  var elt = dojo.create('div');
                  var res = parser._renderTable(elt, new MismatchParser(), new SimpleFeature({data: {seq: "TGATGAGGTCCCTACAAAATCCTATGCTCCCTGCGAATTACAACTCACAGTAAGAAGGGTCACTCTACCAGCGGGGTTAAATATACCGGCCGACTGTCTC", md: "50^agaacagcctaggctttcttagttattgatgcacattctactgacgaacgcagcattcgaactaaaccattggtaatgtaattgtgacacgtgggaatctatttaaagctgcaagaactccaccacgtgttcatccacatcggtctctgtggaatggtccaggaccgtcccaatagggggaattgcgagacccaactaatcgagtgattgaacatgggagcaattcccgaatagaaacttgcaacgcgcagtactacgacgatggtagcaataacgacgcgctacttcagctcatgggtctaaattagggcgaacgattgcacctaatctgctggcttctctagattgtagatccacagggccaattaacagtgcaaagaatagcgtcatatgattagtttgaaaataatatacatgaaaatcgagcacccgcatcaataagctacgagagtctttggagagtgccaatacacctagcacatgctgtgcttatgttatgaaaattcatacttgactaacgttagccaccagccgatggcgctgtcacaacgaccctgggttaccgtttagttctc50", cigar: "50M575D50M"}}));
                  expect(res.val1).toEqual("TGATGAGGTCCCTACAAAATCCTATGCTCCCTGCGAATTACAACTCACAG-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------TAAGAAGGGTCACTCTACCAGCGGGGTTAAATATACCGGCCGACTGTCTC");
                  expect(res.val2).toEqual("||||||||||||||||||||||||||||||||||||||||||||||||||                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               ||||||||||||||||||||||||||||||||||||||||||||||||||");
                  expect(res.val3).toEqual("TGATGAGGTCCCTACAAAATCCTATGCTCCCTGCGAATTACAACTCACAGagaacagcctaggctttcttagttattgatgcacattctactgacgaacgcagcattcgaactaaaccattggtaatgtaattgtgacacgtgggaatctatttaaagctgcaagaactccaccacgtgttcatccacatcggtctctgtggaatggtccaggaccgtcccaatagggggaattgcgagacccaactaatcgagtgattgaacatgggagcaattcccgaatagaaacttgcaacgcgcagtactacgacgatggtagcaataacgacgcgctacttcagctcatgggtctaaattagggcgaacgattgcacctaatctgctggcttctctagattgtagatccacagggccaattaacagtgcaaagaatagcgtcatatgattagtttgaaaataatatacatgaaaatcgagcacccgcatcaataagctacgagagtctttggagagtgccaatacacctagcacatgctgtgcttatgttatgaaaattcatacttgactaacgttagccaccagccgatggcgctgtcacaacgaccctgggttaccgtttagttctcTAAGAAGGGTCACTCTACCAGCGGGGTTAAATATACCGGCCGACTGTCTC");
              });
             });

// only run the cabone_test_2 if it's in the URL someplace
if( document.location.href.indexOf('extended_tests=1') > -1 ) {
    describe( 'BAM with carbone_test_2', function() {
                  var b;
                  beforeEach( function() {
                      b = new BAMStore({
                          browser: new Browser({ unitTestMode: true }),
                          bam: new XHRBlob('../../../data/carbone_test_2/RIB40_278_k51_cd_hit_est_sorted.bam'),
                          bai: new XHRBlob('../../../data/carbone_test_2/RIB40_278_k51_cd_hit_est_sorted.bam.bai'),
                          refSeq: { name: 'gi|338162049|dbj|BA000051.1|', start: 1, end: 5123684 }
                      });
                  });

                  it( 'loads some data', function() {
                          var loaded;
                          var features = [];
                          var done;
                          aspect.after( b, 'loadSuccess', function() {
                              loaded = true;
                          });

    // need 2:3905491-4019507 NODE_423_length_210786_cov_16.121635 3919331 3979772

                          b.getFeatures({ start: 3799999, end: 4049999 },
                                     function( feature ) {
                                         features.push( feature );
                                     },
                                     function() {
                                         done = true;
                                     }
                                   );
                          waitsFor( function() { return done; }, 2000 );
                          runs( function() {
                                    expect(features.length).toEqual(13);
                                    //console.log( distinctBins(features) );
                                });
                      });
    });

}

});

